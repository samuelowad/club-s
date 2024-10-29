import amqp, { Channel } from 'amqplib';
import config from '../config';

const CHANNEL_NAME = 'email_notifications';
const RETRY_INTERVAL = 5000;
const MAX_RETRIES = 10;

class RabbitMQService {
  private channel: Channel | null = null;
  private connection: amqp.Connection | null = null;

  public async init() {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        this.connection = await amqp.connect({
          hostname: config.RABBITMQ_HOST,
          port: Number(config.RABBITMQ_PORT),
          username: config.RABBITMQ_USER,
          password: config.RABBITMQ_PASSWORD,
        });

        this.channel = await this.connection.createChannel();
        console.log('RabbitMQ connected');
        await this.channel.assertQueue(CHANNEL_NAME, { durable: true });
        break;

      } catch (error) {
        console.log(`RabbitMQ connection attempt ${attempt} failed:`, error);

        if (attempt === MAX_RETRIES) {
          console.error('Max retries reached. Exiting process');
          throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
      }
    }
  }

  public async fanOut(message: any) {
    if (!this.channel) {
      await this.init();
      return;
    }

    const msgBuffer = Buffer.from(JSON.stringify(message));

    this.channel.sendToQueue(CHANNEL_NAME, msgBuffer, {
      persistent: true,
    });

    console.log('Booking details sent to RabbitMQ:', message);
  }

  public async close() {
    if (this.channel) {
      await this.channel.close();
      console.log('RabbitMQ channel closed');
    }
    if (this.connection) {
      await this.connection.close();
      console.log('RabbitMQ connection closed');
    }
  }
}

export default new RabbitMQService()
