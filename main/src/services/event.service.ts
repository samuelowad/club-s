import { AppDataSource } from '../database';
import { Event } from '../database/entity/Event';
import { EventInterface } from '../interface';
import {EntityManager, QueryRunner} from 'typeorm';
import {withRLSContext} from "../database/util/withRLSContext";
import {User} from "../database/entity/User";
import {Club} from "../database/entity/Club";

class EventService {
  private eventRepository = AppDataSource.getRepository(Event);
  private clubRepository = AppDataSource.getRepository(Club);

  public async createEvent(event: EventInterface): Promise<Event> {
    try {
      // const newEvent = this.eventRepository.create(event);
      // return this.eventRepository.save(newEvent);

      const withRep3 = await withRLSContext(event.clubId.toString(), async (queryRunner: QueryRunner) => {
        // await new Promise((resolve) => setTimeout(resolve, waitTime));
        // return await queryRunner.manager.findOne(User, { where: { email } });

        const newEvent = queryRunner.manager.create(Event, {...event, club:{id: +event.clubId}});
        return queryRunner.manager.save(newEvent);
      });

      console.log('With repo3:', withRep3);
        return withRep3;
    } catch (error) {
      console.error('Error during event creation:', error);
      throw error;
    }
  }

  public async getEvents(clubId:string): Promise<Event[]> {

    const withRep3 = await withRLSContext(clubId, async (queryRunner: QueryRunner) => {
      // await new Promise((resolve) => setTimeout(resolve, waitTime));
      // return await queryRunner.manager.findOne(User, { where: { email } });

      return queryRunner.manager.find(Event);
    });

    console.log('With repo3:', withRep3);
    return withRep3;
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
