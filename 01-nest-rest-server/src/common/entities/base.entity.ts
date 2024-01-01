import { CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity()
export abstract class BaseModel {
  @PrimaryGeneratedColumn()
  id: number

  @UpdateDateColumn()
  updateAt: Date

  @CreateDateColumn()
  createAt: Date
}
