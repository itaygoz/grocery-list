import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as request from 'supertest';
import { List } from '../../src/lists/schemas/list.schema';
import { User } from '../../src/users/schemas/user.schema';
import { AuthDriver } from '../auth/auth.driver';
import { closeApp, getTestModule, initApp } from '../test.driver';

describe('ListsController (e2e)', () => {
  let app: INestApplication;
  let authDriver: AuthDriver;
  let userModel: Model<User>;
  let listModel: Model<List>;

  beforeAll(async () => {
    app = await initApp();
    authDriver = new AuthDriver(app);
    userModel = getTestModule().get(getModelToken(User.name));
    listModel = getTestModule().get(getModelToken(List.name));
    await userModel.deleteMany({});
  });

  afterEach(async () => {
    // Clean the user collection after each test
    await userModel.deleteMany({});
    await listModel.deleteMany({});
  });

  afterAll(async () => {
    await closeApp();
  });

  it('/lists/metadata (GET) create and get lists', async () => {
    const token = await authDriver.getValidToken();

    const res1 = await request(app.getHttpServer())
      .post('/lists')
      .send({ name: 'list 1' })
      .auth(token, { type: 'bearer' })
      .expect(201);

    const res2 = await request(app.getHttpServer())
      .post('/lists')
      .send({ name: 'list 2' })
      .auth(token, { type: 'bearer' })
      .expect(201);

    return request(app.getHttpServer())
      .get('/lists/metadata')
      .auth(token, { type: 'bearer' })
      .expect(200)
      .expect([res1.body, res2.body]);
  });

  it('/lists/:id (GET) create and get specific list', async () => {
    const token = await authDriver.getValidToken();

    const createdList = await request(app.getHttpServer())
      .post('/lists')
      .send({ name: 'list 1' })
      .auth(token, { type: 'bearer' })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/lists/${createdList.body.id}`)
      .auth(token, { type: 'bearer' })
      .expect(200);
  });
});
