import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne} from 'typeorm';
import { Seat } from './Seat';
import {Club} from "./Club";

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

  @OneToMany(() => Seat, (seat) => seat.event )
  seats: Seat[];

  @ManyToOne(()=> Club, (club) => club.event)
    club: Club;


  @Column()
  availableTickets: number;
}
