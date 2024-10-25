import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Event } from './Event';
import { Ticket } from './Ticket';

@Entity()
export class Seat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  seatNumber: string; // e.g., "A1", "B2"

  @Column()
  isAvailable: boolean;

  @ManyToOne(() => Event, (event) => event.seats)
  event: Event;

  @ManyToOne(() => Ticket, (ticket) => ticket.seats, { nullable: true })
  ticket: Ticket;
}
