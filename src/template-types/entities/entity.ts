import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

import { TemplateFile } from 'src/template-files/entities/entity';


export enum Owner {
  DRIVER = 'driver',
  CAR = 'car'
}

export const OwnerDescription: { [key in keyof typeof Owner]: string } = {
  DRIVER: 'Водитель',
  CAR: 'Автомобиль'
} as const;


@Entity()
@Unique(['name', 'currentFile'])
export class TemplateType {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: Owner,
    update: false
  })
  owner: Owner;

  @Column()
  title: string;

  @Column()
  name: string;

  @Column()
  active: boolean;

  @OneToOne(() => TemplateFile, currentFile => currentFile.currentFileOfType, {
    cascade: true,
    nullable: true
  })
  @JoinColumn()
  currentFile?: TemplateFile;

  @OneToMany(() => TemplateFile, file => file.templateType)
  files: TemplateFile[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;


  @BeforeUpdate()
  beforeUpdate() {
    if (!this.currentFile) {
      this.active = false;
    }
  }

  @BeforeInsert()
  beforeInsert() {
    this.active = !!this.currentFile;
  }

}
