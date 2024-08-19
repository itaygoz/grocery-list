import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users (POST) cerate user', async () => {
    await request(app.getHttpServer())
      .post('/users/create')
      .send({ username: 'itay', password: 'test' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'itay', password: 'test' })
      .expect(201);

    const token = res.body.access_token;

    return request(app.getHttpServer())
      .get('/auth/profile')
      .auth(token, { type: 'bearer' })
      .expect(200)
      .field('username', 'itay');
  });
});
