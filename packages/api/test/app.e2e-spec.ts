import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { closeApp, initApp } from './test.driver';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initApp();
  });

  afterAll(async () => {
    await closeApp();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
