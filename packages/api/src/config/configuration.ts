import { Configuration } from './configuration.types';

export default (): Configuration => ({
  port: parseInt(process.env.PORT) || 3000,
});
