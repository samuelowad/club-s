import request from 'supertest';
import express from 'express';
import ticketRoutes from '../ticket.route';
import authRoutes from '../auth.route';
import eventRoutes from '../event.route';

import { initializeDatabase } from '../../database';
import routes from '../index.routes';
import { authenticate, customerAuthenticate } from '../middleware/authenticate';

const app = express();
app.use(express.json());
// @ts-ignore
app.use('/ticket', authenticate, customerAuthenticate, ticketRoutes);
app.use('/auth', authRoutes);
app.use('/event', eventRoutes);
app.use(routes);

jest.mock('../../services/rabbitMq.service');

let authToken: string;
let adminAuthToken: string;
let eventId: number;

beforeAll(async () => {
  await initializeDatabase();

  const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'test1234@test.com',
        password: 'testPass1',
      });

  authToken = loginResponse.body.data;

  const adminLogin = await request(app)
      .post('/auth/login')
      .send({
        email: 'test123@test.com',
        password: 'testPass1',
      });

  adminAuthToken = adminLogin.body.data;


  const num = Math.floor(Math.random() * 1000000);
  const eventResponse = await request(app)
      .post('/event')
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .send({
        name: 'Upcoming Event ' + num,
        description: 'An exciting event.',
        date: '2024-12-01',
        venue: 'Main Hall',
        availableTickets: 100,
      });


  eventId = eventResponse.body.data.id;
});

describe('Ticket Routes', () => {
  describe('POST /ticket', () => {
    it('should return 401 if no token is provided', async () => {
      const response = await request(app)
          .post('/ticket')
          .send({
            eventId: eventId,
            numberOfTickets: 2,
          });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Token is required');
    });

    it('should return 400 if eventId is missing', async () => {
      const response = await request(app)
          .post('/ticket')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            numberOfTickets: 2,
          });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Event ID is required');
    });

    it('should return 400 if numberOfTickets is not a number', async () => {
      const response = await request(app)
          .post('/ticket')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            eventId: eventId,
            numberOfTickets: 'two',
          });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Number of tickets must be a positive integer');
    });

    it('should return 201 for successful ticket booking', async () => {
      const response = await request(app)
          .post('/ticket')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            eventId: eventId,
            numberOfTickets: 2,
          });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Ticket booked successfully');
    });
  });

  describe('GET /ticket/user', () => {
    it('should return 200 and a list of user tickets', async () => {
      const response = await request(app)
          .get('/ticket/user')
          .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('PUT /ticket/:id/cancel', () => {
    it('should return 401 if no token is provided', async () => {
      const response = await request(app)
          .put('/ticket/someTicketId/cancel');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Token is required');
    });

    it('should return 404 if ticket ID does not exist', async () => {
      const response = await request(app)
          .put('/ticket/50000000/cancel')
          .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Ticket not found');
    });

    it('should return 200 for successful ticket cancellation', async () => {
      const bookingResponse = await request(app)
          .post('/ticket')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            eventId: eventId,
            numberOfTickets: 1,
          });

      const ticketId = bookingResponse.body.data.id;

      const response = await request(app)
          .put(`/ticket/${ticketId}/cancel`)
          .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Ticket cancelled successfully');
    });

    it('should return 400 if seats is not an array', async () => {
      const response = await request(app)
          .post('/ticket')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            eventId: eventId,
            numberOfTickets: 2,
            seats: 'not an array', // Invalid seats format
          });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Seats must be an array');
    });

    it('should return 400 if any seat is not a string', async () => {
      const response = await request(app)
          .post('/ticket')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            eventId: eventId,
            numberOfTickets: 2,
            seats: ['Seat 1', 2], // One seat is a number
          });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid seat format for: 2. Use format "Seat X" where X is a number');
    });

    it('should return 400 if there are duplicate seats', async () => {
      const response = await request(app)
          .post('/ticket')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            eventId: eventId,
            numberOfTickets: 2,
            seats: ['Seat 1', 'Seat 1'], // Duplicate seats
          });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Duplicate seats are not allowed');
    });

    it('should return 400 if number of seats exceeds number of tickets', async () => {
      const response = await request(app)
          .post('/ticket')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            eventId: eventId,
            numberOfTickets: 1, // Only one ticket purchased
            seats: ['Seat 1', 'Seat 2'], // More seats than tickets
          });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Cannot select more seats (2) than tickets purchased (1)');
    });

    it('should return 400 if seat format is invalid', async () => {
      const response = await request(app)
          .post('/ticket')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            eventId: eventId,
            numberOfTickets: 2,
            seats: ['Seat 1', 'InvalidSeat'], // One seat has an invalid format
          });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid seat format for: InvalidSeat. Use format "Seat X" where X is a number');
    });
  });
});
