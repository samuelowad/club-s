import { mailConfig } from '../config';
import * as nodemailer from "nodemailer";
import { logger } from '../utils/logger';
import { Email } from '../database/entity/Email';
import { EmailStatus } from '../enum';

let  transporter: nodemailer.Transporter ;

export async function sendEmail(email: Email, retries = 3) {
  try {
    if (!transporter) {
      transporter = await mailerTransport();
    }

   const sentMail = await transporter.sendMail({
      from: mailConfig.auth.user,
      to: email.email,
      subject: email.subject,
      text: email.body,
    });
    logger.info(`Email successfully sent to ${email.email}`);
    email.status = EmailStatus.SENT;
    return sentMail;
  } catch (error) {
    console.error(`Failed to send email to ${email.email}: ${error}`);
    if (retries > 0) {
     logger.info(`Retrying... attempts left: ${retries}`);
      await sendEmail(email, retries - 1);
    } else {
      email.status = EmailStatus.FAILED;
      logger.error(`Failed to send email to ${email.email} after multiple attempts.`);
    }
  }
}

async function mailerTransport() {
  if(process.env.NODE_ENV === 'test') {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }
  return nodemailer.createTransport(mailConfig);
}
