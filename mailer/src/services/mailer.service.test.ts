import { mailerJob } from './mailer.service';
import { sendEmail } from '../lib/mailer.lib';
import { logger } from '../utils/logger';
import EmailService from './email.service';

jest.mock('../lib/mailer.lib', () => ({
  sendEmail: jest.fn(),
}));

jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
  },
}));

jest.mock('./email.service', () => ({
  getPendingEmails: jest.fn(),
  update: jest.fn(),
}));

describe('mailerJob', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log the pending emails check and send each email', async () => {
    const mockEmails = [
      { to: 'test1@example.com', subject: 'Subject 1', body: 'Body 1' },
      { to: 'test2@example.com', subject: 'Subject 2', body: 'Body 2' },
    ];

    (EmailService.getPendingEmails as jest.Mock).mockResolvedValue(mockEmails);

    await mailerJob();

    expect(logger.info).toHaveBeenCalledWith('Checking for pending emails to send...');

    expect(EmailService.getPendingEmails).toHaveBeenCalled();

    expect(sendEmail).toHaveBeenCalledTimes(mockEmails.length);
    mockEmails.forEach((email, index) => {
      expect(sendEmail).toHaveBeenCalledWith(email);
    });

    expect(EmailService.update).toHaveBeenCalledTimes(mockEmails.length);
    mockEmails.forEach((email) => {
      expect(EmailService.update).toHaveBeenCalledWith(email);
    });
  });

});
