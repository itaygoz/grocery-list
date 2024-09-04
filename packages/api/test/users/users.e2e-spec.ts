import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../src/users/schemas/user.schema';
import { closeApp, getTestModule, initApp } from '../test.driver';
import { UsersDriver } from './users.driver';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let usersDriver: UsersDriver;
  let userModel: Model<User>;

  beforeAll(async () => {
    app = await initApp();
    usersDriver = new UsersDriver(app);
    userModel = getTestModule().get(getModelToken(User.name));
    await userModel.deleteMany({});
  });

  afterEach(async () => {
    // Clean the user collection after each test
    await userModel.deleteMany({});
  });

  afterAll(async () => {
    await closeApp();
  });

  it('/users (POST) cerate user', async () => {
    await usersDriver.createUser(usersDriver.DEFAULT_USER).expect(201);
  });

  it('/users (POST) bad request', async () => {
    await usersDriver.createUser({}).expect(400);
  });

  it('/users (POST) bad request', async () => {
    await usersDriver
      .createUser({ username: 'itay', password: '123' })
      .expect(400);
  });

  it('/users (POST) duplicate username', async () => {
    await usersDriver.createUser({}).expect(400);
  });
});
