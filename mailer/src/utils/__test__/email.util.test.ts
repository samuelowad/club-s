import { generateBookingConfirmationEmail } from '../email.util';
import { EmailData } from '../../interface';

describe("generateBookingConfirmationEmail", () => {
  it("should generate a structured HTML email for booking confirmation", () => {
    const data: EmailData = {
      eventName: "Tech Conference 2024",
      ticketId: 123,
      seatNumbers: ["A1", "A2", "A3"],
      email: "john.doe@example.com",
    };

    const result = generateBookingConfirmationEmail(data);

    const expectedOutput = `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f4f4f9; max-width: 600px; margin: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px;">
          <h2 style="color: #0073e6; text-align: center;">Booking Confirmation</h2>
          
          <p style="font-size: 16px;">Hello <strong>john.doe@example.com</strong>,</p>

          <p style="font-size: 16px;">We are excited to confirm your booking for <strong>Tech Conference 2024</strong>!</p>

          <div style="border-top: 1px solid #e0e0e0; margin: 20px 0;"></div>

          <h3 style="color: #0073e6;">Booking Details</h3>
          <table style="width: 100%; font-size: 16px; color: #555;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Event:</td>
              <td style="padding: 8px 0;">Tech Conference 2024</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Ticket ID:</td>
              <td style="padding: 8px 0;">123</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Seat Numbers:</td>
              <td style="padding: 8px 0;">A1, A2, A3</td>
            </tr>
          </table>

          <p style="margin-top: 20px; font-size: 16px;">Please keep this email as a confirmation of your booking. You may be asked to show this information upon arrival.</p>

          <p style="margin-top: 20px; font-size: 16px; text-align: center; color: #0073e6;"><em>We look forward to seeing you at the event!</em></p>
        </div>

        <div style="margin-top: 20px; text-align: center; font-size: 14px; color: #888;">
          <p>Best regards,<br>The Event Booking Team</p>
          <p style="font-size: 12px; color: #aaa;">Please do not reply to this email. For any inquiries, contact support@example.com.</p>
        </div>
      </div>
    `;

    expect(result.replace(/\s+/g, ' ').trim()).toBe(expectedOutput.replace(/\s+/g, ' ').trim());
  });
});
