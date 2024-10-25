import { Response } from 'express';
import eventService from '../services/event.service';
import {
  errorResponse,
  notFoundResponse,
  successResponse,
  validationErrorResponse
} from '../utils/responseHandler.util';
import { ExtendedRequest } from '../interface';
import TicketService from '../services/ticket.service';
import { User } from '../database/entity/User';
import SeatService from '../services/seat.service';
import { TicketStatusEnum } from '../enum/ticketStatus.enum';
import { AppDataSource } from '../database';

export const bookTicket = async (req: ExtendedRequest, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  try {
    const {eventId, seats, numberOfTickets} = req.body;

    await queryRunner.startTransaction();

    const event = await eventService.getById(eventId, 'seats');
    if (!event) return notFoundResponse(res, 'Event not found');

    event.availableTickets -= numberOfTickets;
    if (event.availableTickets < 0 || event.availableTickets < numberOfTickets) {
      return validationErrorResponse(res, 'No available tickets');
    }

    let requestedSeats = event.seats.filter(seat => seat.isAvailable);
    requestedSeats = requestedSeats.sort((a, b) => a.id - b.id);

    if (seats && seats.length > 0) {
      requestedSeats = requestedSeats.filter(seat => seats.includes(seat.seatNumber));
      if (requestedSeats.length < numberOfTickets) {
        return validationErrorResponse(res, `Requested seats are not available`);
      }
    } else {
      if (requestedSeats.length < numberOfTickets) {
        return validationErrorResponse(res, `Only ${requestedSeats.length} available seats remaining`);
      }
      requestedSeats = requestedSeats.slice(0, numberOfTickets);
    }

    if (requestedSeats.length < numberOfTickets) {
      return validationErrorResponse(res, `Requested seats are not available`);
    }

    requestedSeats.forEach(seat => {
      seat.isAvailable = false
      seat.ticket = newTicket
    });

    const newTicket = await TicketService.createTicket(event, req.user as User, numberOfTickets);


    await Promise.all([
      await SeatService.update(requestedSeats),
      await eventService.update(event)
    ]);

    await queryRunner.commitTransaction();

    return successResponse(res, {id: newTicket.id}, 'Ticket booked successfully', 201);
  } catch (e : any) {
    await queryRunner.rollbackTransaction();
    return errorResponse(res, e);
  } finally {
    await queryRunner.release();
  }
};

export const getUserTickets = async (req: ExtendedRequest, res: Response) => {
  try {
    const tickets = await TicketService.getByParam( { user: { id: req.userId } }, ['seats', 'event']);
    return successResponse(res, tickets, 'Tickets retrieved');
  } catch (e : any) {
    return errorResponse(res, e);
  }
}

export const cancelTicket = async (req: ExtendedRequest, res: Response) => {
    try {
      const ticketId = req.params.id;
      const [ticket] = await TicketService.getByParam({ id: ticketId, user: { id: req.userId } }, ['seats', 'event']);
      if (!ticket) return notFoundResponse(res, 'Ticket not found');
      ticket.status = TicketStatusEnum.CANCELLED

      const event = await eventService.getById(ticket.event.id, 'seats');
      if (!event) return notFoundResponse(res, 'Event not found');

      event.availableTickets += ticket.quantity;
      await eventService.update(event);

      const seats = ticket.seats;
      seats.forEach(seat => {
        seat.isAvailable = true;
        seat.ticket = null;
      });

      await SeatService.update(seats);
      await TicketService.updateTicket( ticket);

      return successResponse(res, {}, 'Ticket cancelled successfully');
    } catch (e : any) {
        return errorResponse(res, e);
    }
}


