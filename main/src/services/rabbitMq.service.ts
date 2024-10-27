import amqp, { Channel } from 'amqplib';
import config from '../config';

const CHANNEL_NAME = 'email_notifications';
class RabbitMQService {
  private channel: Channel | null = null;
  private connection: amqp.Connection | null = null;

  public async init() {
    try {
      this.connection = await amqp.connect({
        hostname: config.RABBITMQ_HOST ,
        port: Number(config.RABBITMQ_PORT) ,
        username: config.RABBITMQ_USER ,
        password: config.RABBITMQ_PASSWORD,
      });
      this.channel = await this.connection.createChannel();
      console.log('RabbitMQ connected');

      await this.channel.assertQueue(CHANNEL_NAME, { durable: true });
    } catch (error) {
      console.error('Error connecting to RabbitMQ:', error);
      throw error;
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
