import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ImageStatusEnum } from '../enum/ImageStatus.enum';

@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fileName: string;

  @Column()
  filePath: string;

  @Column({default: ImageStatusEnum.Uploaded})
  status: ImageStatusEnum;

  @Column({ nullable: true })
  explicit: boolean;

  @Column({ nullable: true })
  imageText: string;
}
