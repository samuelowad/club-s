import { sendEmail } from './email.lib';
import { Email } from '../database/entity/Email';
import * as nodemailer from 'nodemailer';
import { generateBookingConfirmationEmail } from '../utils/email.util';
import { EmailStatus } from '../enum';

describe("sendEmail Functionality", () => {

  let testEmail: Email = {
    id: 1,
    email: 'recipient@example.com',
    subject: 'Booking Confirmation',
    body: '',
    status: EmailStatus.PENDING,
    eventName: "Concert Event",
    ticketId: 12345,
    seatNumbers: ["A1", "A2"],
  };

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
  });

  it("should send a booking confirmation email with the correct body content", async () => {
    testEmail.body = generateBookingConfirmationEmail(testEmail);

    const sentMail = await sendEmail(testEmail);
    expect(sentMail).toBeTruthy();
    expect(sentMail.accepted).toContain(testEmail.email);

    console.log(`Booking Confirmation Preview URL: ${nodemailer.getTestMessageUrl(sentMail)}`);
  });

  it("should handle missing seat numbers in booking confirmation gracefully", async () => {
    const emailWithoutSeats: Email = {
      ...testEmail,
      seatNumbers: []
    };
    emailWithoutSeats.body = generateBookingConfirmationEmail(emailWithoutSeats);

    const sentMail = await sendEmail(emailWithoutSeats);
    expect(sentMail).toBeTruthy();
    expect(sentMail.accepted).toContain(emailWithoutSeats.email);

    console.log(`Preview URL (No Seats): ${nodemailer.getTestMessageUrl(sentMail)}`);
  });

  it("should handle missing event name in booking confirmation gracefully", async () => {
    const emailWithoutEventName: Email = {
      ...testEmail,
      eventName: ""
    };
    emailWithoutEventName.body = generateBookingConfirmationEmail(emailWithoutEventName);

    // Send email and ensure it's accepted
    const sentMail = await sendEmail(emailWithoutEventName);
    expect(sentMail).toBeTruthy();
    expect(sentMail.accepted).toContain(emailWithoutEventName.email);

    console.log(`Preview URL (No Event Name): ${nodemailer.getTestMessageUrl(sentMail)}`);
  });

  it("should throw an error when sending to an invalid email address", async () => {
    const invalidEmail: Email = {
      ...testEmail,
      email: "invalid-email"
    };
    invalidEmail.body = generateBookingConfirmationEmail(invalidEmail);

    await expect(sendEmail(invalidEmail)).rejects.toThrow(/Email send failed/);
  });
});
