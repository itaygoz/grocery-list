import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UsersDriver } from '../users/users.driver';

export class AuthDriver {
  private usersDriver: UsersDriver;
  constructor(private app: INestApplication) {
    this.usersDriver = new UsersDriver(app);
  }

  login(payload) {
    return request(this.app.getHttpServer()).post('/auth/login').send(payload);
  }

  profile(jwt) {
    return request(this.app.getHttpServer())
      .get('/auth/profile')
      .auth(jwt, { type: 'bearer' });
  }

  async getValidToken() {
    await this.usersDriver.createUser(this.usersDriver.DEFAULT_USER);
    const res = await this.login(this.usersDriver.DEFAULT_USER);
    return res.body.access_token;
  }
}
