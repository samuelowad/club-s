import { createEvent, getEvents } from '../../controller/event.controller';
import EventService from '../../services/event.service';
import SeatService from '../../services/seat.service';
import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../../utils/responseHandler.util';
import { ExtendedRequest } from '../../interface';

jest.mock('../../services/event.service');
jest.mock('../../services/seat.service');
jest.mock('../../utils/responseHandler.util');

describe('Event Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      body: {
        name: 'Concert',
        description: 'Live Concert',
        date: '2024-12-25',
        venue: 'Stadium',
        availableTickets: 100,
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('createEvent', () => {
    it('should create an event successfully', async () => {
      (EventService.getEventByName as jest.Mock).mockResolvedValue(null);
      (EventService.createEvent as jest.Mock).mockResolvedValue(req.body);
      (SeatService.createSeat as jest.Mock).mockResolvedValue(null);

      await createEvent(req as ExtendedRequest, res as any);

      expect(EventService.getEventByName).toHaveBeenCalledWith(req.body.name);
      expect(EventService.createEvent).toHaveBeenCalledWith(req.body);
      expect(SeatService.createSeat).toHaveBeenCalledWith(req.body.availableTickets, expect.any(Object));
      expect(successResponse).toHaveBeenCalledWith(res, req.body, 'Event created', 201);
    });

    it('should return an error if event already exists', async () => {
      (EventService.getEventByName as jest.Mock).mockResolvedValue(req.body);

      await createEvent(req as ExtendedRequest, res as any);

      expect(errorResponse).toHaveBeenCalledWith(res, 'Event already exists', 409);
    });

    it('should return an error if event creation fails', async () => {
      (EventService.getEventByName as jest.Mock).mockResolvedValue(null);
      (EventService.createEvent as jest.Mock).mockRejectedValue(new Error('Event creation failed'));

      await createEvent(req as ExtendedRequest, res as any);

      expect(errorResponse).toHaveBeenCalledWith(res, 'Event creation failed', 500);
    });
  });

  describe('getEvents', () => {
    it('should retrieve events successfully', async () => {
      const events = [{ name: 'Concert' }, { name: 'Theater' }];
      (EventService.getEvents as jest.Mock).mockResolvedValue(events);

      await getEvents(req as any, res as any);

      expect(successResponse).toHaveBeenCalledWith(res, events, 'Events retrieved');
    });

    it('should return an error if retrieving events fails', async () => {
      (EventService.getEvents as jest.Mock).mockRejectedValue(new Error('Failed to retrieve events'));

      await getEvents(req as any, res as any);

      expect(errorResponse).toHaveBeenCalledWith(res, 'Failed to retrieve events', 500);
    });
  });
});
