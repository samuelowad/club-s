import RabbitMQService from '../rabbitMq.service';
import amqp, { Channel } from 'amqplib';

jest.mock('amqplib');

describe('RabbitMQService', () => {
  let mockChannel: jest.Mocked<Channel>;
  let mockConnection: jest.Mocked<amqp.Connection>;

  beforeEach(() => {
    mockChannel = {
      assertQueue: jest.fn(),
      sendToQueue: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<Channel>;

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      close: jest.fn(),
    } as unknown as jest.Mocked<amqp.Connection>;

    (amqp.connect as jest.Mock).mockResolvedValue(mockConnection);
  });

  afterEach(async () => {
    await RabbitMQService.close();
  });

  it('should initialize RabbitMQ connection and channel', async () => {
    await RabbitMQService.init();

    expect(amqp.connect).toHaveBeenCalledWith({
      hostname: 'rabbitmq',
      port: 5672,
      username: 'guest',
      password: 'guest',
    });
    expect(mockConnection.createChannel).toHaveBeenCalled();
    expect(mockChannel.assertQueue).toHaveBeenCalledWith('email_notifications', { durable: true });
  });

  it('should send a message to the queue', async () => {
    await RabbitMQService.init();
    const message = { email: 'test@example.com', eventId: '123', ticketId: '456', seatNumbers: [1, 2] };

    await RabbitMQService.fanOut(message);

    expect(mockChannel.sendToQueue).toHaveBeenCalledWith('email_notifications', expect.any(Buffer), {
      persistent: true,
    });
  });

  it('should close the RabbitMQ connection', async () => {
    await RabbitMQService.init();

    await RabbitMQService.close();

    expect(mockChannel.close).toHaveBeenCalled();
    expect(mockConnection.close).toHaveBeenCalled();
  });
});
