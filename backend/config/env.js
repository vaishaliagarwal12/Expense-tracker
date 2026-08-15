const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const DEFAULT_DEV_JWT_SECRET = 'fintrack_super_secret_jwt_key_change_in_production_2026';
const isProduction = (process.env.NODE_ENV || 'development') === 'production';

let jwtSecret = process.env.JWT_SECRET;
if (isProduction) {
  if (!jwtSecret || jwtSecret === DEFAULT_DEV_JWT_SECRET || jwtSecret.trim() === '') {
    throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable must be set to a custom secret in production mode.');
  }
} else {
  jwtSecret = jwtSecret || DEFAULT_DEV_JWT_SECRET;
}

let clientUrl = process.env.CLIENT_URL;
if (isProduction) {
  if (!clientUrl || clientUrl === '*' || clientUrl.trim() === '') {
    throw new Error('FATAL SECURITY ERROR: CLIENT_URL environment variable must be explicitly defined (and cannot be "*") in production mode.');
  }
} else {
  clientUrl = clientUrl || 'http://localhost:5173';
}

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: jwtSecret,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DB: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'fintrack_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    url: process.env.DATABASE_URL
  },
  CLIENT_URL: clientUrl
};
