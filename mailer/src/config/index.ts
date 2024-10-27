import dotenv from 'dotenv';
import { MailConfig } from '../interface';
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
  RABBITMQ_USER: process.env.RABBITMQ_USER || 'guest',
  RABBITMQ_PASSWORD: process.env.RABBITMQ_PASSWORD || 'password',
};

export const mailConfig: MailConfig = {
  service: process.env.MAIL_SERVICE || "gmail",
  auth: {
    user: process.env.GMAIL_USER || "",
    pass: process.env.GMAIL_PASS || "",
  },
};
