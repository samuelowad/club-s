import amqp from 'amqplib';
import { connectRabbitMQ } from './messageConsumer';
import EmailService from '../services/email.service';
import { logger } from '../utils/logger';

jest.mock('amqplib', () => ({
  connect: jest.fn(),
}));

jest.mock('../services/email.service', () => ({
  createEmail: jest.fn(),
}));

describe('RabbitMQ Consumer', () => {
  const mockChannel = {
    assertQueue: jest.fn(),
    consume: jest.fn(),
    ack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(logger, 'info');
    jest.spyOn(logger, 'error');
  });

  it('should connect to RabbitMQ and set up a consumer', async () => {
    (amqp.connect as jest.Mock).mockResolvedValue({
      createChannel: jest.fn().mockResolvedValue(mockChannel),
    });

    await connectRabbitMQ();

    expect(amqp.connect).toHaveBeenCalledWith(process.env.RABBITMQ_URL || 'amqp://localhost');
    expect(mockChannel.assertQueue).toHaveBeenCalledWith('email_notifications', { durable: true });
    expect(mockChannel.consume).toHaveBeenCalledWith('email_notifications', expect.any(Function));
    expect(logger.info).toHaveBeenCalledWith('RabbitMQ consumer is up and listening for messages...');
  });

  it('should process incoming messages and acknowledge them', async () => {
    const mockMessage = {
      content: Buffer.from(JSON.stringify({ email: 'test@example.com', subject: 'Test Subject', body: 'Test Body' })),
    };

    (mockChannel.consume as jest.Mock).mockImplementation((queue, callback) => {
      callback(mockMessage);
    });

    await connectRabbitMQ();

    expect(EmailService.createEmail).toHaveBeenCalledWith({
      email: 'test@example.com',
      subject: 'Test Subject',
      body: 'Test Body',
    });

    expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
  });

  it('should log an error if the connection to RabbitMQ fails', async () => {
    const mockError = new Error('Connection failed');
    (amqp.connect as jest.Mock).mockRejectedValue(mockError);

    await connectRabbitMQ();

    expect(logger.error).toHaveBeenCalledWith('Error connecting to RabbitMQ', mockError);
  });
});
