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
  host: string;
  port: number
  secure: boolean
  auth: {
    user: string;
    pass: string;
  };
}
