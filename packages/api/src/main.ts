import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Configuration } from './config/configuration.types';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<Configuration>);
  const port = configService.get<string>('port');
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(port);
}
bootstrap();
