export interface EmailData {
  eventName: string;
  ticketId: number;
  seatNumbers: string[];
  email: string;
  subject?: string;
  body?: string;
}

export interface MailConfig {
  service: string;
  auth: {
    user: string;
    pass: string;
  };
}
