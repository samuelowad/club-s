// @ts-nocheck
import express, {Router} from 'express';
import * as ticketController from '../controller/ticket.controller';
import { ticketPurchaseValidationRules, validateRequest } from './middleware/validator';
import { attachUser } from './middleware/authenticate';
const router = Router();

router.get('/')
router.post('/', attachUser, validateRequest(ticketPurchaseValidationRules),ticketController.bookTicket);
router.get('/user', ticketController.getUserTickets);
router.put('/:id/cancel', ticketController.cancelTicket);


export default router;
