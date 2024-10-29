import amqp from 'amqplib';
import { connectRabbitMQ } from './messageConsumer';
import EmailService from '../services/email.service';
import { logger } from '../utils/logger';
import { EmailData } from '../interface';

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

    expect(mockChannel.assertQueue).toHaveBeenCalledWith('email_notifications', { durable: true });
    expect(mockChannel.consume).toHaveBeenCalledWith('email_notifications', expect.any(Function));
    expect(logger.info).toHaveBeenCalledWith('RabbitMQ consumer is up and listening for messages');
  });

  it('should process incoming messages and acknowledge them', async () => {
    const mockEmail:EmailData = { email: 'test@example.com', subject: 'Test Subject', body: 'Test Body', seatNumbers: ['A1', 'A2'], eventName:'test event', ticketId:2 }
    const mockMessage = {
      content: Buffer.from(JSON.stringify(mockEmail)),
    };

    (mockChannel.consume as jest.Mock).mockImplementation((queue, callback) => {
      callback(mockMessage);
    });

    await connectRabbitMQ();

    expect(EmailService.createEmail).toHaveBeenCalledWith(mockEmail);

    expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
  });
});
