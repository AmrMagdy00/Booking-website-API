import { registerAs } from '@nestjs/config';

/**
 * JWT configuration - JWT token settings
 * Registers JWT secret and expiration settings from environment variables
 */
export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN,
}));
