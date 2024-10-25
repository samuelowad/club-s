import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Seat } from './Seat';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  date: Date;

  @Column()
  venue: string;

  @OneToMany(() => Seat, (seat) => seat.event, )
  seats: Seat[];

  @Column()
  availableTickets: number;
}
