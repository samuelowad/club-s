import {Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, ManyToOne} from 'typeorm';
import { UserRole } from '../../enum/userRole.enum';
import { Ticket } from './Ticket';
import {Club} from "./Club";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @OneToMany(() => Ticket, (ticket) => ticket.user)
  tickets: Ticket[];

  @ManyToOne(()=> Club, (club) => club.user)
    club: Club;
}
