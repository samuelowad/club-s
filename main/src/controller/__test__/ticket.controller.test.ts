import { bookTicket, cancelTicket, getUserTickets } from '../ticket.controller';
import eventService from '../../services/event.service';
import TicketService from '../../services/ticket.service';
import SeatService from '../../services/seat.service';
import { Response } from 'express';
import {
  errorResponse,
  notFoundResponse,
  successResponse,
  validationErrorResponse
} from '../../utils/responseHandler.util';
import { ExtendedRequest } from '../../interface';
import { UserRole } from '../../enum/userRole.enum';
import { AppDataSource } from '../../database';

jest.mock('../../services/event.service');
jest.mock('../../services/ticket.service');
jest.mock('../../services/seat.service');
jest.mock('../../utils/responseHandler.util');
jest.mock('../../services/rabbitMq.service');

describe('Ticket Controller', () => {
  let req: Partial<ExtendedRequest>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      body: {
        eventId: '1',
        seats: ['A1', 'A2'],
        numberOfTickets: 2,
      },
      user: {
        id: 2,
        email: 'test@example.com',
        password: 'password',
        role: UserRole.CUSTOMER,
        tickets: [],
      },
      params: {
        id: 'ticketId',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });
  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  describe('bookTicket', () => {
    it('should book a ticket successfully', async () => {
      const mockEvent = {
        id: '1',
        availableTickets: 5,
        seats: [
          { seatNumber: 'A1', isAvailable: true },
          { seatNumber: 'A2', isAvailable: true },
        ],
      };
      (eventService.getById as jest.Mock).mockResolvedValue(mockEvent);
      (TicketService.createTicket as jest.Mock).mockResolvedValue({ id: 'ticketId' });
      (SeatService.update as jest.Mock).mockResolvedValue(null);
      (eventService.update as jest.Mock).mockResolvedValue(null);

      await bookTicket(req as ExtendedRequest, res as Response);

      expect(eventService.getById).toHaveBeenCalledWith(req.body.eventId, 'seats');
      // expect(TicketService.createTicket).toHaveBeenCalledWith(mockEvent, req.user, req.body.numberOfTickets);
      expect(SeatService.update).toHaveBeenCalledWith(mockEvent.seats);
      expect(successResponse).toHaveBeenCalledWith(res, { id: 'ticketId' }, 'Ticket booked successfully', 201);
    });

    it('should return validation error if no available tickets', async () => {
      const mockEvent = {
        id: '1',
        availableTickets: 0,
        seats: [],
      };
      (eventService.getById as jest.Mock).mockResolvedValue(mockEvent);

      await bookTicket(req as ExtendedRequest, res as Response);

      expect(validationErrorResponse).toHaveBeenCalledWith(res, 'No available tickets');
    });

    it('should return validation error if requested seats are not available', async () => {
      const mockEvent = {
        id: '1',
        availableTickets: 5,
        seats: [{ seatNumber: 'A1', isAvailable: false }],
      };
      (eventService.getById as jest.Mock).mockResolvedValue(mockEvent);

      await bookTicket(req as ExtendedRequest, res as Response);

      expect(validationErrorResponse).toHaveBeenCalledWith(res, 'Requested seats are not available');
    });

    it('should return error if booking fails', async () => {
      (eventService.getById as jest.Mock).mockResolvedValue(null); // Event not found

      await bookTicket(req as ExtendedRequest, res as Response);

      expect(notFoundResponse).toHaveBeenCalledWith(res, 'Event not found');
    });
  });

  describe('getUserTickets', () => {
    it('should retrieve user tickets successfully', async () => {
      const mockTickets = [{ id: 'ticketId', event: { id: 'eventId' } }];
      (TicketService.getByParam as jest.Mock).mockResolvedValue(mockTickets);

      await getUserTickets(req as ExtendedRequest, res as Response);

      expect(successResponse).toHaveBeenCalledWith(res, mockTickets, 'Tickets retrieved');
    });

    it('should return error if retrieving tickets fails', async () => {
      (TicketService.getByParam as jest.Mock).mockRejectedValue(new Error('Failed to retrieve tickets'));

      await getUserTickets(req as ExtendedRequest, res as Response);

      expect(errorResponse).toHaveBeenCalledWith(res, expect.any(Error));
    });
  });

  describe('cancelTicket', () => {
    it('should cancel a ticket successfully', async () => {
      const mockTicket = {
        id: 'ticketId',
        quantity: 2,
        seats: [
          { isAvailable: false, ticket: {} },
          { isAvailable: false, ticket: {} },
        ],
        event: { id: 'eventId' },
      };
      const mockEvent = {
        id: 'eventId',
        availableTickets: 5,
      };
      (TicketService.getByParam as jest.Mock).mockResolvedValue([mockTicket]);
      (eventService.getById as jest.Mock).mockResolvedValue(mockEvent);
      (eventService.update as jest.Mock).mockResolvedValue(null);
      (SeatService.update as jest.Mock).mockResolvedValue(null);
      (TicketService.updateTicket as jest.Mock).mockResolvedValue(null);

      await cancelTicket(req as ExtendedRequest, res as Response);

      expect(eventService.getById).toHaveBeenCalledWith(mockTicket.event.id, 'seats');
      expect(successResponse).toHaveBeenCalledWith(res, {}, 'Ticket cancelled successfully');
    });

    it('should return not found error if ticket does not exist', async () => {
      (TicketService.getByParam as jest.Mock).mockResolvedValue([]);

      await cancelTicket(req as ExtendedRequest, res as Response);

      expect(notFoundResponse).toHaveBeenCalledWith(res, 'Ticket not found');
    });

    it('should return error if cancelling fails', async () => {
      (TicketService.getByParam as jest.Mock).mockRejectedValue(new Error('Failed to cancel ticket'));

      await cancelTicket(req as ExtendedRequest, res as Response);

      expect(errorResponse).toHaveBeenCalledWith(res, expect.any(Error));
    });
  });
});
