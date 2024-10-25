
import request from 'supertest';
import express from 'express';
import authRoutes from '../auth.route';
import { errorResponse } from '../../utils/responseHandler.util';
import { initializeDatabase } from '../../database';

const app = express();
app.use(express.json()); // Middleware to parse JSON
app.use('/auth', authRoutes);

beforeAll(async () => {
  await initializeDatabase()
});

describe('Auth Routes', () => {
  describe('POST /auth/signup', () => {
    it('should return 400 if email is missing', async () => {
      const response = await request(app)
          .post('/auth/signup')
          .send({ password: 'Password123', role: 'customer' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Email is required');
    });

    it('should return 400 if email format is invalid', async () => {
      const response = await request(app)
          .post('/auth/signup')
          .send({ email: 'invalidEmail', password: 'Password123', role: 'customer' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid email format');
    });

    it('should return 400 if password is less than 8 characters', async () => {
      const response = await request(app)
          .post('/auth/signup')
          .send({ email: 'test@example.com', password: '1234', role: 'customer' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Password must contain at least one uppercase letter');
    });

    it('should return 201 for successful signup', async () => {
      const num = Math.floor(Math.random() * 1000000);
      const response = await request(app)
          .post('/auth/signup')
          .send({ email: `test${num}@example.com`, password: 'Password123', role: 'customer' });

      expect(response.status).toBe(201);
    });
  });

  describe('POST /auth/login', () => {
    it('should return 400 if email is missing', async () => {
      const response = await request(app)
          .post('/auth/login')
          .send({ password: 'Password123' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Email is required');
    });

    it('should return 200 for successful login', async () => {
      const response = await request(app)
          .post('/auth/login')
          .send({ email: 'test@example.com', password: 'Password123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login successful');
    });
  });
});
