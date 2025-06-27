import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { AuthUser } from 'src/auth/schemas/auth.schema';
import { DatabaseService } from 'src/common/database/database.service';
import { User } from 'src/users/schemas/user.schema';
import { Logger } from 'winston';

@Injectable()
export class UsersService {
  constructor(
    private readonly db: DatabaseService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  async findByEmail(email: string): Promise<AuthUser> {
    const user = await this.db
      .selectFrom('users')
      .select(['username', 'password', 'id', 'email'])
      .where('email', '=', email)
      .executeTakeFirst();

    if (!user) {
      throw new HttpException('user not found', HttpStatus.BAD_REQUEST);
    }

    return user;
  }

  async findById(id: number): Promise<User> {
    const user = await this.db
      .selectFrom('users')
      .select(['id', 'username', 'email'])
      .where('id', '=', id)
      .executeTakeFirst();

    console.log(id, 'telo');
    if (!user) {
      throw new HttpException('user not found', HttpStatus.BAD_REQUEST);
    }

    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.db
      .selectFrom('users')
      .select(['id', 'username', 'email'])
      .where('username', '=', username)
      .executeTakeFirst();

    if (!user) {
      throw new HttpException('user not found', HttpStatus.BAD_REQUEST);
    }

    return user;
  }
}
