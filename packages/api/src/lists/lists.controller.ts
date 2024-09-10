import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { User } from '../auth/decorators/user.decorator';
import { UserDto } from '../users/dto/user.dto';
import { ListsService } from './lists.service';

@Controller('lists')
export class ListsController {
  constructor(private readonly service: ListsService) {}

  @Post()
  create(@User() { userId }: UserDto, @Body('name') name: string) {
    return this.service.create(userId, name);
  }

  @Get('/metadata')
  findAll(@User() { userId }: UserDto) {
    return this.service.getLists(userId);
  }

  @Get(':id')
  getList(@User() { userId }: UserDto, @Param('id') listId: string) {
    return this.service.getList(userId, listId);
  }

  @Delete(':id')
  remove(@User() { userId }: UserDto, @Param('id') listId: string) {
    return this.service.remove(userId, listId);
  }
}
