import { Request, Response } from 'express';
import { createAccount } from '../auth.controller';
import UserService from '../../services/user.service';
import bcrypt from 'bcryptjs';

jest.mock('../../services/user.service');
jest.mock('bcryptjs');

describe('Auth Controller - createAccount', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      body: {
        email: 'test@example.com',
        password: 'password123',
        role: 'customer'
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('should create an account successfully', async () => {
    (UserService.getUserByEmail as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    (UserService.createUser as jest.Mock).mockResolvedValue(req.body);

    await createAccount(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: '',
      data: '',
    }));
  });

  it('should return a conflict error if user already exists', async () => {
    (UserService.getUserByEmail as jest.Mock).mockResolvedValue({ email: 'test@example.com' });

    await createAccount(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'User already exists',
    }));
  });

  it('should return an error if hashing the password fails', async () => {
    (UserService.getUserByEmail as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hashing failed'));

    await createAccount(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Hashing failed',
    }));
  });

  it('should return a server error if user creation fails', async () => {
    (UserService.getUserByEmail as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    (UserService.createUser as jest.Mock).mockRejectedValue(new Error('Database error'));

    await createAccount(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Database error',
    }));
  });
});
