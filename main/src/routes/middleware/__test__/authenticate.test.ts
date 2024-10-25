import { NextFunction, Response } from 'express';
import { authenticate, adminAuthenticate, customerAuthenticate, attachUser } from '../authenticate';
import JwtUtil from '../../../utils/jwt.util';
import UserService from '../../../services/user.service';
import { notFoundResponse, unauthorizedResponse } from '../../../utils/responseHandler.util';
import { UserRole } from '../../../enum/userRole.enum';

jest.mock('../../../utils/jwt.util');
jest.mock('../../../services/user.service');
jest.mock('../../../utils/responseHandler.util', () => ({
  notFoundResponse: jest.fn(),
  unauthorizedResponse: jest.fn().mockImplementation((res, message) => {
    res.status(401).json({ error: message });
  }),
}));

describe('Middleware', () => {
  let req: any;
  let res: any;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
      userId: null,
      role: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('authenticate', () => {
    it('should call unauthorizedResponse if token is missing', () => {
      authenticate(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token is required' });
    });

    it('should call next if token is valid', () => {
      const token = 'validToken';
      const decoded = { id: 1, role: UserRole.CUSTOMER };
      req.headers['authorization'] = `Bearer ${token}`;
      (JwtUtil.verify as jest.Mock).mockReturnValue(decoded);

      authenticate(req, res, next);

      expect(req.userId).toBe(1);
      expect(req.role).toBe(UserRole.CUSTOMER);
      expect(next).toHaveBeenCalled();
    });

    it('should call unauthorizedResponse if token verification fails', () => {
      const token = 'invalidToken';
      req.headers['authorization'] = `Bearer ${token}`;
      (JwtUtil.verify as jest.Mock).mockImplementation(() => { throw new Error('Invalid token'); });

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    });
  });

  describe('adminAuthenticate', () => {
    it('should call unauthorizedResponse if role is not ADMIN', () => {
      req.role = UserRole.CUSTOMER;

      adminAuthenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Admin access required' });
    });

    it('should call next if role is ADMIN', () => {
      req.role = UserRole.ADMIN;

      adminAuthenticate(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('customerAuthenticate', () => {
    it('should call unauthorizedResponse if role is not CUSTOMER', async () => {
      req.role = UserRole.ADMIN;

      await customerAuthenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Customer access required' });
    });

    it('should call next if role is CUSTOMER', async () => {
      req.role = UserRole.CUSTOMER;

      await customerAuthenticate(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('attachUser', () => {
    it('should call notFoundResponse if user does not exist', async () => {
      req.userId = 1;
      (UserService.getUserById as jest.Mock).mockResolvedValue(null);

      await attachUser(req, res, next);

      expect(notFoundResponse).toHaveBeenCalledWith(res, 'User not found');
    });

    it('should attach user to req and call next if user exists', async () => {
      const user = { id: 1, name: 'Test User' };
      req.userId = 1;
      (UserService.getUserById as jest.Mock).mockResolvedValue(user);

      await attachUser(req, res, next);

      expect(req.user).toEqual(user);
      expect(next).toHaveBeenCalled();
    });
  });
});
