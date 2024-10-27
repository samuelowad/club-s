import amqp from 'amqplib';
import EmailService from '../services/email.service';
import { EmailData } from '../interface';
import { logger } from '../utils/logger';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const CHANNEL_NAME = 'email_notifications';

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(CHANNEL_NAME, { durable: true });

    await channel.consume(CHANNEL_NAME, async (msg) => {
      if (msg !== null) {
        const emailData: EmailData = JSON.parse(msg.content.toString());
        console.log('Received email data:', emailData);

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
