import express, {Router} from 'express';

import  * as authController from '../controller/auth.controller';
import { authenticate } from './middleware/authenticate';
import { registerValidationRules, loginValidationRules, validateRequest } from './middleware/validator';
import {setClubContext} from "../middleware/tenantContext.middleware";

const router = Router();

router.post('/signup', validateRequest(registerValidationRules), authController.createAccount);
// @ts-ignore
router.post('/login', validateRequest(loginValidationRules), authController.login);
// @ts-ignore
router.get('/profile', authenticate, authController.getProfile);

export default router;
