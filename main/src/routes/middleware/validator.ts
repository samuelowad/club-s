import { body, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../../utils/responseHandler.util';

export const registerValidationRules = [
  body('email')
      .exists().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .trim()
      .normalizeEmail(),

  body('password')
      .exists().withMessage('Password is required')
      .isLength({ min: 4 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number'),

  body('role')
      .isIn(['customer', 'admin']).withMessage('Invalid role specified')
];

export const loginValidationRules = [
  body('email')
      .exists().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .trim()
      .normalizeEmail(),

  body('password')
      .exists().withMessage('Password is required')
      .notEmpty().withMessage('Password cannot be empty')
];

export const eventValidationRules = [
  body('name')
      .exists().withMessage('Event name is required')
      .isString().withMessage('Event name must be a string')
      .trim()
      .isLength({ min: 3, max: 100 }).withMessage('Event name must be between 3 and 100 characters'),

  body('description')
      .exists().withMessage('Event description is required')
      .isString().withMessage('Event description must be a string')
      .trim()
      .isLength({ min: 5, max: 1000 }).withMessage('Event description must be between 10 and 1000 characters'),

  body('date')
      .exists().withMessage('Event date is required')
      .isISO8601().withMessage('Invalid date format. Please use ISO8601 format (YYYY-MM-DD)')
      .custom((value) => {
        const eventDate = new Date(value);
        const today = new Date();
        if (eventDate < today) {
          throw new Error('Event date cannot be in the past');
        }
        return true;
      }),

  body('venue')
      .exists().withMessage('Venue is required')
      .isString().withMessage('Venue must be a string')
      .trim()
      .isLength({ min: 3, max: 200 }).withMessage('Venue must be between 3 and 200 characters'),

  body('availableTickets')
      .exists().withMessage('Number of available tickets is required')
      .isInt({ min: 1 }).withMessage('Number of available tickets must be a positive integer')
      .custom((value) => {
        const tickets = parseInt(value);
        if (tickets > 100000) {
          throw new Error('Maximum 100,000 tickets allowed per event');
        }
        return true;
      })
];

export const ticketPurchaseValidationRules: ValidationChain[] = [
  body('numberOfTickets')
      .exists().withMessage('Number of tickets is required')
      .isInt({ min: 1 }).withMessage('Number of tickets must be a positive integer')
      .custom((value: number): boolean => {
        if (value > 10) {
          throw new Error('Maximum 10 tickets allowed per purchase');
        }
        return true;
      }),

  body('eventId')
        .exists().withMessage('Event ID is required')
        .isInt({ min: 1 }).withMessage('Invalid event ID'),

  body('seats')
      .optional()
      .isArray().withMessage('Seats must be an array')
      .custom((seats: string[], { req }): boolean => {
        if (seats) {
          const allStrings = seats.every((seat: string): boolean => true);
          if (!allStrings) {
            throw new Error('All seats must be strings');
          }

          const uniqueSeats = new Set(seats);
          if (uniqueSeats.size !== seats.length) {
            throw new Error('Duplicate seats are not allowed');
          }

          const numberOfTickets: number = req.body.numberOfTickets;
          if (seats.length > numberOfTickets) {
            throw new Error(`Cannot select more seats (${seats.length}) than tickets purchased (${numberOfTickets})`);
          }

          const seatPattern: RegExp = /^Seat \d+$/;
          const invalidSeats: string[] = seats.filter((seat: string): boolean => !seatPattern.test(seat));
          if (invalidSeats.length > 0) {
            throw new Error(`Invalid seat format for: ${invalidSeats.join(', ')}. Use format "Seat X" where X is a number`);
          }
        }
        return true;
      })
];

const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return errorResponse(res, firstError.msg, 400);
  }
  next();
};

export const validateRequest = (validations: ValidationChain[]) => {
  return [...validations, validate];
};
