import { EmailBodyData } from '../interface';

export const generateBookingConfirmationEmail = (data: EmailBodyData): string =>{
  const { eventName, ticketId, seatNumbers, email } = data;

  return `
    Hello ${email},

    We are excited to confirm your booking for the event "${eventName}"!

    Here are the details of your booking:

    - **Event**: ${eventName}
    - **Ticket ID**: ${ticketId}
    - **Seat Numbers**: ${seatNumbers.join(", ")}

    Please keep this email as confirmation of your booking. You may be asked to show this information upon arrival. We look forward to seeing you at the event!

    Best regards,
    Event Booking Team
  `;
}
