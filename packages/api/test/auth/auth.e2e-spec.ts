import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../src/users/schemas/user.schema';
import { closeApp, getTestModule, initApp } from '../test.driver';
import { UsersDriver } from '../users/users.driver';
import { AuthDriver } from './auth.driver';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let usersDriver: UsersDriver;
  let authDriver: AuthDriver;
  let userModel: Model<User>;

  beforeAll(async () => {
    app = await initApp();
    usersDriver = new UsersDriver(app);
    authDriver = new AuthDriver(app);
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

  it('/auth/login (POST) then validate JWT token', async () => {
    await usersDriver.createUser(usersDriver.DEFAULT_USER).expect(201);

    const res = await authDriver.login(usersDriver.DEFAULT_USER).expect(200);

    const token = res.body.access_token;

    return authDriver.profile(token).expect(200).field('username', 'itay');
  });

  it('/auth/profile (POST) Unauthorized', async () => {
    const token = 'bad token';

    return authDriver.profile(token).expect(401);
  });

  it('/auth/login (POST) Unauthorized', async () => {
    return authDriver
      .login({ username: 'notExist', password: 'notExist' })
      .expect(401);
  });
});
