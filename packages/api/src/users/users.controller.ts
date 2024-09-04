import { Body, Controller, Post, UseFilters } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserExceptionFilter } from './filter/user-exception.filter';
import { Public } from '../auth/decorators/public.decorator';
import { CreateUserRequest } from './dto/create-user.request';

@Controller('users')
@UseFilters(UserExceptionFilter)
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Public()
  @Post('create')
  async createUser(@Body() user: CreateUserRequest) {
    return this.service.createUser(user.username, user.password);
  }
}
