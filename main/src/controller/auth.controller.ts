import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import UserService from '../services/user.service';
import { ExtendedRequest, UserInterface } from '../interface';
import {
    conflictResponse,
    errorResponse, notFoundResponse,
    successResponse,
    validationErrorResponse
} from '../utils/responseHandler.util';
import JwtUtil from '../utils/jwt.util';


export const createAccount = async (req: Request, res: Response) => {
    try {
        const { email, password, role } = req.body;

        const userExists = await UserService.getUserByEmail(email);
        if (userExists) return conflictResponse(res, 'User already exists');

        const hashedPassword = await bcrypt.hash(password, 10);
        const user : UserInterface = {
            email,
            password: hashedPassword,
            role,
        }

        await UserService.createUser(user);
        return successResponse(res, '', '', 201);
    } catch (error:any) {
        return errorResponse(res, error.message);
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await UserService.getUserByEmail(email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return validationErrorResponse(res, 'Invalid email or password');
        }
        const token = JwtUtil.sign(user.email, user.id, user.role);
        return successResponse(res, token, 'Login successful');
    } catch (error:any) {
        return errorResponse(res, error.message);
    }
}

export const getProfile = async (req: ExtendedRequest, res: Response) => {
    try {
        const userId = req.userId;
        const user = await UserService.getUserById(userId);
        if (!user) return notFoundResponse(res, 'User not found');
        const { password, ...rest } = user;
        return successResponse(res, rest, 'User profile retrieved');
    } catch (error:any) {
        return errorResponse(res, error.message);
    }
}
