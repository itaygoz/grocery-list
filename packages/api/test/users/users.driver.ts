import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export class UsersDriver {
  public DEFAULT_USER = { username: 'itay', password: 'test12strongPass@!' };
  constructor(private app: INestApplication) {}

  createUser(payload) {
    return request(this.app.getHttpServer())
      .post('/users/create')
      .send(payload);
  }
}
