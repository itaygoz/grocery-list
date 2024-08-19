export interface Configuration {
  port: number;
  mongodb: MongoDBConfig;
}

export interface MongoDBConfig {
  username: string;
  password: string;
  host: string;
  port: number;
}
