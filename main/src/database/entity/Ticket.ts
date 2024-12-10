import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { Event } from './Event';
import { TicketStatusEnum } from '../../enum/ticketStatus.enum';
import { Seat } from './Seat';
import {Club} from "./Club";

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.id)
  user: User;

  @ManyToOne(() => Event, event => event.id)
  event: Event;

  @OneToMany(() => Seat, (seat) => seat.ticket, { cascade: true })
  seats: Seat[];

  // @ManyToOne(()=> Club, (club) => club.ticket)
  // club: Club;

  @Column()
  quantity: number;

  @Column({ default: TicketStatusEnum.BOOKED })
  status: TicketStatusEnum;
}
