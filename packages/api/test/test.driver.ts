import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';

let app: INestApplication<any>;
let moduleFixture: TestingModule;

export async function initApp() {
  moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  return app.init();
}

export async function closeApp() {
  await app.close();
}

export function getTestModule() {
  return moduleFixture;
}
