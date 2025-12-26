import { registerAs } from '@nestjs/config';

/**
 * App configuration - Application-level configuration
 * Registers app settings like port from environment variables
 */
export default registerAs('app', () => ({
  port: Number(process.env.PORT) || 3000,
}));
