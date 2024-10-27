import amqp from 'amqplib';
import EmailService from '../services/email.service';
import { EmailData } from '../interface';
import { logger } from '../utils/logger';
import config from '../config';
import { generateBookingConfirmationEmail } from '../utils/email.util';

const CHANNEL_NAME = 'email_notifications';

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect({
      hostname: config.RABBITMQ_HOST,
      port: Number(config.RABBITMQ_PORT) ,
      username: config.RABBITMQ_USER ,
      password: config.RABBITMQ_PASSWORD ,
    });
    const channel = await connection.createChannel();

    await channel.assertQueue(CHANNEL_NAME, { durable: true });

    await channel.consume(CHANNEL_NAME, async (msg) => {
      if (msg !== null) {
        const emailData: EmailData = JSON.parse(msg.content.toString());
        await EmailService.createEmail(emailData);
        channel.ack(msg);
      }
    });

    logger.info('RabbitMQ consumer is up and listening for messages...');
  } catch (error) {
    logger.error('Error connecting to RabbitMQ',  error);
  }
}

export { connectRabbitMQ };
