import { JwtModuleOptions } from '@nestjs/jwt';

export interface Configuration {
  port: number;
  mongodb: MongoDBConfig;
  redis: RedisConfig;
  jwt: JwtModuleOptions;
}

export interface MongoDBConfig {
  username: string;
  password: string;
  host: string;
  port: number;
}

export interface RedisConfig {
  host: string;
  port: number;
  ttl: number;
}
