import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { UserModel } from './user.entity'

@Entity()
export class ProfileModel {
  @PrimaryGeneratedColumn()
  id: number

  // UserModel에 user의 profile 컬럼과 1:1 연결
  @OneToOne(() => UserModel, user => user.profile)
  // 상대방 테이블의 id를 가지고 있기(만약 상대방이 갖고있으면 상대방이 이 테이블 id를 가짐)
  @JoinColumn()
  user: UserModel

  @Column()
  profileImg: string
}
