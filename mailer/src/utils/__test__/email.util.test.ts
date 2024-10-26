// generateBookingConfirmationEmail.test.ts
import { generateBookingConfirmationEmail } from '../email.util';
import { EmailBodyData } from '../../interface';

describe("generateBookingConfirmationEmail", () => {
  it("should generate a correct booking confirmation email body", () => {
    const data: EmailBodyData = {
      eventName: "Tech Conference 2024",
      ticketId: 123,
      seatNumbers: ["A1", "A2", "A3"],
      email: "john.doe@example.com",
    };

    const result = generateBookingConfirmationEmail(data);

    const expectedOutput = `
    Hello john.doe@example.com,

    We are excited to confirm your booking for the event "Tech Conference 2024"!

    Here are the details of your booking:

    - **Event**: Tech Conference 2024
    - **Ticket ID**: 123
    - **Seat Numbers**: A1, A2, A3

    Please keep this email as confirmation of your booking. You may be asked to show this information upon arrival. We look forward to seeing you at the event!

    Best regards,
    Event Booking Team
  `;

    expect(result.replace(/\s+/g, ' ').trim()).toBe(expectedOutput.replace(/\s+/g, ' ').trim());
  });
});
