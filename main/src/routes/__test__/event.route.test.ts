import request from 'supertest';
import express from 'express';
import eventRoutes from '../event.route';
import authRoutes from '../auth.route';
import { initializeDatabase } from '../../database';

const app = express();
app.use(express.json());
app.use('/event', eventRoutes);
app.use('/auth', authRoutes);

let adminAuthToken: string;

beforeAll(async () => {
  await initializeDatabase();

  const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'test123@test.com',
        password: 'testPass1',
      });

  adminAuthToken = loginResponse.body.data
});

describe('Event Routes', () => {
  describe('POST /event', () => {
    it('should return 400 if event name is missing', async () => {
      console.log(adminAuthToken);
      const response = await request(app)
          .post('/event')
          .set('Authorization', `Bearer ${adminAuthToken}`)
          .send({
            description: 'An exciting event.',
            date: '2024-12-01',
            venue: 'Main Hall',
            availableTickets: 100,
          });

      console.log(response.body);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Event name is required');
    });

    it('should return 400 if event name is too short', async () => {
      const response = await request(app)
          .post('/event')
          .set('Authorization', `Bearer ${adminAuthToken}`)
          .send({
            name: 'AB',
            description: 'An exciting event.',
            date: '2024-12-01',
            venue: 'Main Hall',
            availableTickets: 100,
          });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Event name must be between 3 and 100 characters');
    });

    it('should return 400 if event date is in the past', async () => {
      const response = await request(app)
          .post('/event')
          .set('Authorization', `Bearer ${adminAuthToken}`)
          .send({
            name: 'Upcoming Event',
            description: 'An exciting event.',
            date: '2020-01-01',
            venue: 'Main Hall',
            availableTickets: 100,
          });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Event date cannot be in the past');
    });

    it('should return 400 if available tickets exceed limit', async () => {
      const response = await request(app)
          .post('/event')
          .set('Authorization', `Bearer ${adminAuthToken}`)
          .send({
            name: 'Upcoming Event',
            description: 'An exciting event.',
            date: '2024-12-01',
            venue: 'Main Hall',
            availableTickets: 150000,
          });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Maximum 100,000 tickets allowed per event');
    });

    it('should return 201 for successful event creation', async () => {
      const num = Math.floor(Math.random() * 1000000);
      const response = await request(app)
          .post('/event')
          .set('Authorization', `Bearer ${adminAuthToken}`)
          .send({
            name: 'Upcoming Event'+num,
            description: 'An exciting event.',
            date: '2024-12-01',
            venue: 'Main Hall',
            availableTickets: 100,
          });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Event created');
    });
  });

  describe('GET /event', () => {
    it('should return 200 and a list of events', async () => {
      const response = await request(app)
          .get('/event')

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(false);
    });
  });
});
