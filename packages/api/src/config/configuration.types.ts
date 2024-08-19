import { JwtModuleOptions } from '@nestjs/jwt';

export interface Configuration {
  port: number;
  mongodb: MongoDBConfig;
  jwt: JwtModuleOptions;
}

export interface MongoDBConfig {
  username: string;
  password: string;
  host: string;
  port: number;
}
