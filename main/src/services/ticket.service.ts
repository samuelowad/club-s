import { AppDataSource } from '../database';
import { Ticket } from '../database/entity/Ticket';
import { User } from '../database/entity/User';
import { Event } from '../database/entity/Event';

class TicketService {
  private ticketRepository = AppDataSource.getRepository(Ticket);

    public async createTicket(event: Event, user:User, quantity: number) {
      const newTicket = this.ticketRepository.create({event, user, quantity});
      return await this.ticketRepository.save(newTicket);
    }

    public async getTickets() {
      return await this.ticketRepository.find();
    }

    public async getTicketById(id: number) {
      return await this.ticketRepository.findOne( {where: { id}});
    }

    public updateTicket(id: number, ticket: Ticket) {
      return this.ticketRepository.update(id, ticket);
    }

  public async getByParam(param: any, relation?: string[]) {
    return await this.ticketRepository.find({
      where: param,
      relations: relation
    });
  }
}

export default new TicketService();
