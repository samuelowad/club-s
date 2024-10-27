// @ts-nocheck
import {Router} from 'express';

import  * as eventController from '../controller/event.controller';
import { adminAuthenticate, authenticate, customerAuthenticate } from './middleware/authenticate';
import { eventValidationRules, validateRequest } from './middleware/validator';

const router = Router();

router.post('/', authenticate, adminAuthenticate, validateRequest([eventValidationRules]), eventController.createEvent);
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEvent);

export  default router;
