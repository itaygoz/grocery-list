import { Body, Controller, Post, UseFilters } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserExceptionFilter } from './filter/user-exception.filter';
import { Public } from '../auth/decorators/public.decorator';

@Controller('users')
@UseFilters(UserExceptionFilter)
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Public()
  @Post('create')
  async createUser(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    return this.service.createUser(username, password);
  }
}
