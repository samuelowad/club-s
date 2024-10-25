import { AppDataSource } from '../database';
import { Event } from '../database/entity/Event';
import { EventInterface } from '../interface';
import { EntityManager } from 'typeorm';


class EventService {
  private  eventRepository = AppDataSource.getRepository(Event);

    public createEvent(event: EventInterface): Promise<Event> {
      try{
        const newEvent = this.eventRepository.create(event);
        return this.eventRepository.save(newEvent);
      } catch (error) {
          console.error('Error during event creation:', error);
          throw error;
      }
    }

    public getEvents() {
      return this.eventRepository.find();
    }

    public getEventByName(name: string) {
      return this.eventRepository.findOne({where: {name}});
    }

    public getById(id: number, relation?: string) {
      if (!relation) return this.eventRepository.findOneBy({id});
      return this.eventRepository.findOne({where: {id}, relations: [relation]});
    }

    public update(event: Event) {
      return this.eventRepository.save(event);
    }

  public async runInTransaction(action: (transactionalEntityManager: EntityManager) => Promise<any>) {
    return await this.eventRepository.manager.transaction(action);
  }
}

export default new EventService();
