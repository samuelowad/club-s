import express, { Router } from 'express';
import authRoutes from './auth.route';
import eventRoutes from './event.route';
import ticketRoutes from './ticket.route';
import { authenticate, customerAuthenticate } from './middleware/authenticate';

const routes = express.Router({ mergeParams: true });

routes.use('/auth', authRoutes);
routes.use('/event', eventRoutes);
// @ts-ignore
routes.use('/ticket',authenticate, customerAuthenticate, ticketRoutes);

const router = Router();
router.use('/v1', routes);

export default router;
