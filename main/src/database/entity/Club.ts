import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne} from 'typeorm';
import { Event } from './Event';
import { Ticket } from './Ticket';
import {User} from "./User";

@Entity()
export class Club {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(() => Event, (event) => event.club)
    event: Event[];

    @OneToMany(()=> User, (user) => user.club)
    user: User[];

    // @OneToMany(() => Ticket, (ticket) => ticket.club )
    // ticket: Ticket[];
}
