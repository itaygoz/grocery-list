import { Configuration } from './configuration.types';

export default (): Configuration => ({
  port: parseInt(process.env.PORT) || 3000,
  mongodb: {
    username: process.env.MONGODB_USERNAME,
    password: process.env.MONGODB_PASSWORD,
    host: process.env.MONGODB_HOST,
    port: parseInt(process.env.MONGODB_PORT) || 27017,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
    signOptions: {
      expiresIn: process.env.JWT_EXPIRES_IN || '2h',
    },
  },
});
