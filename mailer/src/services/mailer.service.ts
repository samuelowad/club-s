import { sendEmail } from '../lib/mailer.lib';
import { logger } from '../utils/logger';
import EmailService from './email.service';

export async function mailerJob() {
  logger.info('Checking for pending emails to send...');

  const pendingEmails = await EmailService.getPendingEmails();

  for (const email of pendingEmails) {
    await sendEmail(email);
    await EmailService.update(email);
  }
}
