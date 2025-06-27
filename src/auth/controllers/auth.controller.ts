import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { GetUser, Public } from '../../common/decorators/auth.decorator';
import {
  JwtPayload,
  LoginResponse,
  LoginResponseDto,
  LoginUserDto,
  LogoutDto,
  RefreshTokenDto,
  RegisterUserDto,
  UserResponse,
  UserResponseDto,
} from '../schemas/auth.schema';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { WebResponse } from 'src/common/schemas/web.schema';

@Controller('/api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Public()
  @Post('/register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User registered successfully',
    type: WebResponse.forSwagger(UserResponseDto),
  })
  async register(
    @Body() request: RegisterUserDto,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.authService.register(request);
    return {
      data: result,
    };
  }

  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Login user and get tokens' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login success',
    type: WebResponse.forSwagger(LoginResponseDto),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  async login(
    @Body() request: LoginUserDto,
  ): Promise<WebResponse<LoginResponse>> {
    const result = await this.authService.login(request);

    return {
      data: result,
    };
  }

  @Public()
  @Get('/refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'New access and refresh tokens issued',
    type: WebResponse.forSwagger(LoginResponseDto),
  })
  async refresh(
    @Body() request: RefreshTokenDto,
  ): Promise<WebResponse<LoginResponse>> {
    const result = await this.authService.refresh(request.refreshToken);
    return {
      data: result,
    };
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user and revoke refresh token' })
  @ApiBody({ type: LogoutDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logout successful',
    type: String,
  })
  async logout(
    @GetUser() payload: JwtPayload,
    @Body() body: LogoutDto,
  ): Promise<WebResponse<string>> {
    if (body?.all) {
      await this.authService.deleteAllRefreshToken(body.refreshToken);
    } else {
      await this.authService.deleteRefreshToken(body.refreshToken, payload);
    }
    return {
      data: 'Logout successful',
    };
  }
}
