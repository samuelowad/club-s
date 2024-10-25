import { NextFunction, Response } from 'express';
import { ExtendedRequest } from '../../interface';
import { notFoundResponse, unauthorizedResponse } from '../../utils/responseHandler.util';
import JwtUtil from '../../utils/jwt.util';
import { UserRole } from '../../enum/userRole.enum';
import UserService from '../../services/user.service';


export const authenticate = (req: ExtendedRequest, res: Response, next: NextFunction) :void => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return unauthorizedResponse(res, 'Token is required', 401);
  }

  try {
    const {id, role} = JwtUtil.verify(token);
    req.userId = id;
    req.role = role;
    next();
  } catch (error) {
    return unauthorizedResponse(res, 'Invalid token', 401);
  }
};

export const adminAuthenticate = (req: ExtendedRequest, res: Response, next: NextFunction) :void => {
  if (req.role !== UserRole.ADMIN) {
    return unauthorizedResponse(res, 'Admin access required', 401);
  }
  next();
}

export const customerAuthenticate = async (req: ExtendedRequest, res: Response, next: NextFunction) :Promise<void> => {
    if (req.role !== UserRole.CUSTOMER) {
      return unauthorizedResponse(res, 'Customer access required', 401);
    }

    next();
}

export const attachUser = async (req: ExtendedRequest, res: Response, next: NextFunction) :Promise<void> => {
  const user = await UserService.getUserById(req.userId);
  if(!user) return notFoundResponse(res, 'User not found');

  req.user = user;

  next()
}
