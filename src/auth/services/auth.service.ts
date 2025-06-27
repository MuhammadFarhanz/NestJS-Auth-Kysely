import { SignOptions, TokenExpiredError } from 'jsonwebtoken';
import { UsersService } from '../../users/services/users.service';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from 'src/common/database/database.service';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import {
  JwtPayload,
  LoginResponse,
  LoginUser,
  RefreshToken,
  RegisterUser,
  UserResponse,
} from '../schemas/auth.schema';
import { randomBytes } from 'crypto';
import { addDays } from 'date-fns';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private readonly db: DatabaseService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async register(req: RegisterUser): Promise<UserResponse> {
    this.logger.debug(`Registering user: ${req.username}, ${req.email}`);

    const existingUser = await this.db
      .selectFrom('users')
      .select(['username', 'email'])
      .where((eb) =>
        eb.or([eb('username', '=', req.username), eb('email', '=', req.email)]),
      )
      .executeTakeFirst();

    if (existingUser) {
      if (existingUser.email === req.email) {
        throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          'Username already taken',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    req.password = await bcrypt.hash(req.password, 10);

    const user = await this.db
      .insertInto('users')
      .values({
        username: req.username,
        email: req.email,
        password: req.password,
      })
      .returning(['id', 'username', 'email'])
      .executeTakeFirstOrThrow();

    this.logger.info(`User created successfully: ${user.username}`);

    return {
      id: user.id,
      email: user.email,
      username: user.username,
    };
  }

  async login(req: LoginUser): Promise<LoginResponse> {
    this.logger.debug(req);
    const user = await this.usersService.findByEmail(req.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.debug(user);

    const isPasswordValid = await bcrypt.compare(req.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Password');
    }

    const payload = { sub: user.id };

    const accessToken = await this.createAccessToken(payload);
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  //TOKEN STUFF
  async refresh(refreshToken: string) {
    const token = await this.db
      .selectFrom('refreshTokens')
      .selectAll()
      .select(['expiresAt', 'value', 'userId'])
      .where('value', '=', refreshToken)
      .executeTakeFirst();

    if (!token) {
      throw new HttpException('Token not found', HttpStatus.BAD_REQUEST);
    }

    const currentDate = new Date();
    if (token.expiresAt < currentDate) {
      throw new HttpException('Token expired', HttpStatus.BAD_REQUEST);
    }

    const payload = { sub: token.userId };
    const accessToken = await this.createAccessToken(payload);

    // delete old refreshtoken
    await this.db
      .deleteFrom('refreshTokens')
      .where('value', '=', token.value)
      .execute();

    const newRefreshToken = await this.createRefreshToken(token.userId);

    return {
      accessToken: accessToken,
      refreshToken: newRefreshToken,
    };
  }

  private async createAccessToken(payload: { sub: number }) {
    const options: SignOptions = {
      jwtid: uuid(),
      expiresIn: '15m',
    };

    const token = await this.jwtService.signAsync(payload, options);

    return token;
  }

  private async createRefreshToken(userId: number) {
    const refreshToken = randomBytes(64).toString('hex');

    const token: RefreshToken = {
      value: refreshToken,
      userId: userId,
      expiresAt: addDays(new Date(), 30),
    };

    await this.db.insertInto('refreshTokens').values(token).execute();

    return refreshToken;
  }

  // * Removes a refresh token, and invalidated all access tokens for the user
  async deleteRefreshToken(value: string, payload: any) {
    await this.db
      .deleteFrom('refreshTokens')
      .where('value', '=', value)
      .execute();

    await this.revokeToken(payload);
  }

  // Remove refresh token associated to a user
  async deleteAllRefreshToken(payload: any) {
    await this.db
      .deleteFrom('refreshTokens')
      .where('userId', '=', payload.sub)
      .execute();

    // Note: Individual access tokens will expire naturally
  }

  async validateToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get('jwt.secret'),
    });
  }

  async validatePayload(token: string) {
    const payload: JwtPayload = await this.jwtService
      .verifyAsync(token, {
        secret: this.configService.get('jwt.secret'),
      })
      .catch((error) => {
        if (error instanceof TokenExpiredError) {
          throw new UnauthorizedException('Token expired');
        }
      });

    await this.isBlacklisted(payload);

    return payload;
  }

  async isBlacklisted(payload: any) {
    const isBlacklisted = await this.cacheManager.get(`bl:${payload.jti}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token is revoked. Please log in again.');
    }
  }

  private async revokeToken(payload: JwtPayload): Promise<any> {
    const ttl = payload.exp * 1000 - Date.now();

    if (ttl > 0) {
      await this.cacheManager.set(`bl:${payload.jti}`, true, ttl);
    }
  }
}
