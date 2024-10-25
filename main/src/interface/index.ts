import { Request } from 'express';
import { UserRole } from '../enum/userRole.enum';
import { User } from '../database/entity/User';

export interface ExtendedRequest extends Request {
    userId: number;
    role: UserRole;
    user?: User
}

export interface EventInterface {
    name: string;
    description: string;
    date: string;
    venue: string;
    availableTickets: number;
}

export interface UserInterface {
    email: string;
    password: string;
    role: UserRole;
}

export interface TicketPurchaseRequest {
    numberOfTickets: number;
    seats?: string[];
}
