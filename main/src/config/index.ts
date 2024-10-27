import dotenv from 'dotenv';
dotenv.config();

export default {
  POSTGRES_HOST: process.env.POSTGRES_HOST || 'localhost',
  POSTGRES_PORT: process.env.POSTGRES_PORT || '5432',
  POSTGRES_USER: process.env.POSTGRES_USER || 'user',
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || 'password',
  POSTGRES_DB: process.env.POSTGRES_DB || 'images_db',
  SERVER_PORT: process.env.SERVER_PORT || 3000,
  RABBITMQ_HOST: process.env.RABBITMQ_HOST || 'localhost',
  RABBITMQ_PORT: process.env.RABBITMQ_PORT || 5672,
  RABBITMQ_USER: process.env.RABBITMQ_USER || 'user',
  RABBITMQ_PASSWORD: process.env.RABBITMQ_PASSWORD || 'password',
};
