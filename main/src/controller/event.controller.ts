import { errorResponse, successResponse } from '../utils/responseHandler.util';
import EventService from '../services/event.service';
import { EventInterface, ExtendedRequest } from '../interface';
import SeatService from '../services/seat.service';
import { Event } from '../database/entity/Event';


export const createEvent = async (req: ExtendedRequest, res: Response,) => {
    try {
      const { name, description, date, venue, availableTickets } = req.body;
      const event: EventInterface = {
        name,
        description,
        date,
        venue,
        availableTickets,
      }
      const eventExists = await EventService.getEventByName(name);
      if (eventExists) return errorResponse(res, 'Event already exists', 409);

      const newEvent:Event = await EventService.createEvent(event);
      await SeatService.createSeat(availableTickets, newEvent);
      return successResponse(res, newEvent, 'Event created', 201);
    } catch (error:any) {
      return errorResponse(res, error.message, 500);
    }
}

export const getEvents = async (req: Request, res: Response) => {
    try {
      const events = await EventService.getEvents();
      return successResponse(res, events, 'Events retrieved');
    } catch (error:any) {
      return errorResponse(res, error.message, 500);
    }
}
