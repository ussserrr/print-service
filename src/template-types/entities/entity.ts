import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { TemplateFile } from 'src/template-files/entities/entity';


export enum Owner {
  DRIVER = 'driver',
  CAR = 'car'
}


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

  @Column({ default: true })
  active: boolean;

  @OneToOne(() => TemplateFile, currentFile => currentFile.currentFileOfType, {
    cascade: true,
    nullable: true
  })
  @JoinColumn()
  currentFile?: TemplateFile;

  @OneToMany(() => TemplateFile, file => file.templateType)
  files: TemplateFile[];

}
