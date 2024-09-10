import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cache } from 'cache-manager';
import { Model } from 'mongoose';
import { ListMetadataDto } from './dto/list-metadata.dto';
import { List } from './schemas/list.schema';
import { ListDto } from './dto/list.dto';

@Injectable()
export class ListsService {
  private readonly logger = new Logger(ListsService.name);
  constructor(
    @InjectModel(List.name) private listModel: Model<List>,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async create(userId: string, listName: string): Promise<ListMetadataDto> {
    const newList = new this.listModel({
      userId,
      name: listName,
      items: [],
      changelog: [],
    });
    const { name, date, items, _id } = await newList.save();
    this.logger.debug(`list ${name} created for user: ${userId} list: ${_id}`);
    await this.cache.set(`user:${userId}:list:${_id}`, {
      id: _id,
      name,
      date,
      items,
    });
    return { id: _id as string, name, date: date };
  }

  async getLists(userId: string): Promise<ListMetadataDto[]> {
    const queriedLists = await this.listModel.find({ userId });
    return queriedLists.map((l) => ({
      id: l._id as string,
      name: l.name,
      date: l.date,
    }));
  }

  async getList(userId: string, listId: string): Promise<ListDto> {
    let cachedList = await this.cache.get<ListDto>(
      `user:${userId}:list:${listId}`,
    );
    if (!cachedList) {
      const { name, date, items } = await this.listModel.findById(listId);
      cachedList = {
        id: listId,
        name,
        date,
        items,
      };
      await this.cache.set(`user:${userId}:list:${listId}`, cachedList);
    }

    return cachedList;
  }

  remove(userId: string, listId: string) {
    this.cache.del(`user:${userId}:list:${listId}`);
    return this.listModel.deleteOne({ _id: listId });
  }
}
