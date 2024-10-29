import amqp from 'amqplib';
import EmailService from '../services/email.service';
import { EmailData } from '../interface';
import { logger } from '../utils/logger';
import config from '../config';

const CHANNEL_NAME = 'email_notifications';
const RETRY_INTERVAL = 5000;
const MAX_RETRIES = 10;

async function connectRabbitMQ() {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const connection = await amqp.connect({
        hostname: config.RABBITMQ_HOST,
        port: Number(config.RABBITMQ_PORT),
        username: config.RABBITMQ_USER,
        password: config.RABBITMQ_PASSWORD,
      });

      const channel = await connection.createChannel();
      await channel.assertQueue(CHANNEL_NAME, { durable: true });

      await channel.consume(CHANNEL_NAME, async (msg) => {
        if (msg) {
          const emailData:EmailData = JSON.parse(msg.content.toString());
          await EmailService.createEmail(emailData);
          channel.ack(msg);
        }
      });

      logger.info('RabbitMQ consumer is up and listening for messages');
      break;

    } catch (error) {
      logger.error(`RabbitMQ connection attempt ${attempt} failed:`, error);
      if (attempt === MAX_RETRIES) {
        logger.error('Max retries reached. Exiting process');
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
    }
  }
}

export { connectRabbitMQ };
