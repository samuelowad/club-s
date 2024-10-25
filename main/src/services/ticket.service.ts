import { AppDataSource } from '../database';
import { Ticket } from '../database/entity/Ticket';
import { User } from '../database/entity/User';
import { Event } from '../database/entity/Event';
import { Seat } from '../database/entity/Seat';
import RabbitMQService from './rabbitMq.service';

class TicketService {
  private ticketRepository = AppDataSource.getRepository(Ticket);

    public async createTicket(event: Event, user:User, quantity: number) {
      try{
        let newTicket = this.ticketRepository.create({event, user, quantity});
        newTicket = await this.ticketRepository.save(newTicket);

        // const message = {
        //   email: user.email,
        //   eventName: event.name,
        //   ticketId: newTicket.id,
        //   seatNumbers: seats.map(seat => seat.seatNumber),
        // };

        // await RabbitMQService.fanOut(message);
        return newTicket;
      } catch (error) {
        console.error('Error during ticket creation:', error);
        throw error;
      }
    }

    public updateTicket(ticket: Ticket) {
      return this.ticketRepository.save(ticket);
    }

  public getByParam(param: any, relation?: string[]) {
    return this.ticketRepository.find({
      where: param,
      relations: relation
    });
  }
}

export default new TicketService();
