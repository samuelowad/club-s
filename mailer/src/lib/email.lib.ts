import { mailConfig } from '../config';
import * as nodemailer from "nodemailer";
import { logger } from '../utils/logger';
import { Email } from '../database/entity/Email';

let  transporter: nodemailer.Transporter ;

export async function sendEmail(email: Email) {
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

    return sentMail;
  } catch (error) {
    logger.error(`Failed to send email to ${email.email}: ${error}`);
    throw new Error(`Email send failed: ${error}`);
  }
}

async function mailerTransport() {
  if(process.env.NODE_ENV === 'test') {
    const testAccount = await nodemailer.createTestAccount();
    console.log('Test account:', testAccount);
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
