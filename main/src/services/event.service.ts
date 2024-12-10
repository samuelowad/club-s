import { AppDataSource } from '../database';
import { Event } from '../database/entity/Event';
import { EventInterface } from '../interface';
import { EntityManager } from 'typeorm';

class EventService {
  private eventRepository = AppDataSource.getRepository(Event);

  public async createEvent(event: EventInterface): Promise<Event> {
    try {
      const newEvent = this.eventRepository.create(event);
      return this.eventRepository.save(newEvent);
    } catch (error) {
      console.error('Error during event creation:', error);
      throw error;
    }
  }

  public async getEvents(): Promise<Event[]> {
    return this.eventRepository.find();
  }

  public async getEventByName(name: string): Promise<Event | null> {
    return this.eventRepository.findOne({ where: { name } });
  }

  public async getById(id: number, relation?: string): Promise<Event | null> {
    const options: any = { where: { id } };
    if (relation) {
      options.relations = [relation];
    }
    return this.eventRepository.findOne(options);
  }

  public async update(event: Event): Promise<Event> {
    return this.eventRepository.save(event);
  }

  public async runInTransaction(action: (transactionalEntityManager: EntityManager) => Promise<any>) {
    return await this.eventRepository.manager.transaction(action);
  }
}

export default new EventService();
