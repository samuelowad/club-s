import { Request, Response } from 'express';
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

export const bookTicket = async (req: ExtendedRequest, res: Response) => {
  try {
    const {eventId, seats, numberOfTickets} = req.body;

    const event = await eventService.getById(eventId, 'seats');
    if (!event) return notFoundResponse(res, 'Event not found');

    event.availableTickets -= numberOfTickets;

    const seatsAvailable = event.seats.filter(seat => seat.isAvailable);
    if (seatsAvailable.length < numberOfTickets) return validationErrorResponse(res, `Only ${seatsAvailable.length} tickets available`);

    const requestedSeats = seatsAvailable.filter(seat => seats.includes(seat.seatNumber));
    if (requestedSeats.length < numberOfTickets) return validationErrorResponse(res, 'Requested seats are not available');

    const newTicket = await TicketService.createTicket(event, req.user as User, numberOfTickets);

    requestedSeats.forEach(seat => {
      seat.isAvailable = false
      seat.ticket = newTicket
    });

    await SeatService.update(requestedSeats);
    await eventService.update(event);


    return successResponse(res, {id: newTicket.id}, 'Ticket booked successfully', 201);
  } catch (e : any) {
    return errorResponse(res, e);
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

export  const cancelTicket = async (req: ExtendedRequest, res: Response) => {
    try {
        const ticketId = req.params.id;
        const [ticket] = await TicketService.getByParam({ id: ticketId, user: { id: req.userId } }, ['seats', 'event']);
        if (!ticket) return notFoundResponse(res, 'Ticket not found');

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
        // await TicketService.delete(ticketId);

        return successResponse(res, {}, 'Ticket cancelled successfully');
    } catch (e : any) {
        return errorResponse(res, e);
    }
}


