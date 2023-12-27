import { Column, Entity, PrimaryColumn } from 'typeorm'

export class Name {
  @Column()
  first: string

  @Column()
  last: string
}

@Entity()
export class StudentModel {
  @PrimaryColumn()
  id: number

  @Column(() => Name)
  name: Name

  @Column()
  class: string
}

@Entity()
export class TeacherModel {
  @PrimaryColumn()
  id: number

  @Column(() => Name)
  name: Name

  @Column()
  salary: number
}
