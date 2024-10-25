// @ts-nocheck
import {Router} from 'express';

import  * as eventController from '../controller/event.controller';
import { adminAuthenticate, customerAuthenticate } from './middleware/authenticate';
import { eventValidationRules, validateRequest } from './middleware/validator';

const router = Router();

router.post('/', adminAuthenticate, validateRequest([eventValidationRules]), eventController.createEvent);
router.get('/', eventController.getEvents);

export  default router;
