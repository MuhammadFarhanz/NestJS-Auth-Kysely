import { UsersService } from '../services/users.service';
import { Controller, Get } from '@nestjs/common';
import { User } from 'src/users/schemas/user.schema';
import { WebResponse } from 'src/common/schemas/web.schema';
import { GetUser } from 'src/common/decorators/auth.decorator';
import { JwtPayload } from 'src/auth/schemas/auth.schema';

@Controller('/api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/profile')
  async getProfile(@GetUser() user: JwtPayload): Promise<WebResponse<User>> {
    const result = await this.usersService.findById(user.sub);

    return {
      data: result,
    };
  }
}
