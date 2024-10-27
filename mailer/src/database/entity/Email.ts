import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { EmailStatus } from '../../enum';

@Entity()
export class Email {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  subject: string;

  @Column()
  body: string;

  @Column({ default: EmailStatus.PENDING })
  status: EmailStatus;

  @Column({ type: "varchar", length: 100 })
  eventName: string;

  @Column()
  ticketId: number;

  @Column({ type: "simple-array" })
  seatNumbers: string[];
}
