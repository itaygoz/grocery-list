import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { hash } from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly saltRounds = 10;
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(username: string, password: string): Promise<User> {
    const hashedPassword = await hash(password, this.saltRounds);
    const newUser = new this.userModel({ username, password: hashedPassword });
    return newUser.save();
  }

  async findByName(username: string): Promise<User> {
    return this.userModel.findOne({ username }).exec();
  }
}
