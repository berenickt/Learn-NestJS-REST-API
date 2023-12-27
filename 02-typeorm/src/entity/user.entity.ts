import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm'

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
export class UserModel {
  /*** ID
   * 자동으로 ID를 생성한다.
   *
   * 📌 @PrimaryGeneratedColumn()
   * Primary Column은 모든 테이블에서 기본적으로 존재해야 한다
   * 테이블 안에서 각각의 Row를 구분할 수 있는 컬럼이다.
   * @PrimaryColumn()
   *
   * 📌 @PrimaryGeneratedColumn('uuid')
   * PrimaryGeneratedColumn => 순서대로 위로 올라간다.
   * 1, 2, 3, 4, 5 -> 999999
   *
   * UUID : 절대로 겹치지 않는 고유한 값을 만들어줌
   * ea36ed96-8d1c-44d9-9fbe-4ec6960e95a8
   */
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    // 데이터베이스에서 인지하는 컬럼 타입 (자동으로 유추됨)
    type: 'varchar',
    // 데이터베이스 칼럼 이름 (프로퍼티 이름으로 자동 유추됨)
    name: 'title',
    // 값의 길이(입력할 수 있는 글자의 길이가 300)
    length: 300,
    // null이 가능한지
    nullable: true,
    // true면 처음 저장할 때만 값 지정 가능(이후에는 값 변경 불가능)
    update: true,
    // find()를 실행할 떄, 기본으로 값을 불러올지 (기본값은 true)
    select: false,
    // 아무것도 입력안했을 떄, 기본으로 입력되게 되는 값
    default: 'default value',
    // 컬럼 중에서 유일한 값이 돼야하는지(기본값은 false), 보통 회원이메일 컬럼에 사용
    unique: false,
  })
  title: string

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role

  /** 데이터 생성 일자
   * 데이터가 생성되는 날짜와 시간이 자동으로 찍힌다.
   */
  @CreateDateColumn()
  createdAt: Date

  /** 데이터 수정 일자
   * 데이터가 업데이트되는 날짜와 시간이 자동으로 찍힌다.
   */
  @UpdateDateColumn()
  updateAt: Date

  /** 데이터가 업데이트 될 떄마다 1씩 올라간다
   * 처음 생성되면 값은 1이다.
   * save() 함수가 몇 번 불렸는지 기억한다.
   */
  @VersionColumn()
  version: number

  /**
   * 📌 @Generated('increment')
   * additionalId: number
   * PrimaryColumn은 아닌데, 데이터 생성할 떄마다, 1씩 올라가는 컬럼
   *
   * 📌 Generated('uuid')
   * additionalId: string
   * 는 마찬가지로,
   * PrimaryColumn은 아닌데, 데이터 생성할 떄마다, 고유값을 가지는 컬럼
   */
  @Column()
  @Generated('uuid')
  additionalId: string
}
