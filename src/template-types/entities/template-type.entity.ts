import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { TemplateFile } from 'src/template-files/entities/template-file.entity';


export enum Owner {
  DRIVER = 'driver',
  CAR = 'car'
}

@Entity()
@Unique(['currentFile'])  // TODO: also should belongs to [files]
export class TemplateType {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: Owner,
    update: false
  })
  owner!: Owner;

  @Column()
  title!: string;

  @Column({ default: true })
  active!: boolean;

  @Column({ update: false })
  folder!: string;

  @OneToOne(() => TemplateFile, currentFile => currentFile.currentFileOfType, {
    cascade: true,
    nullable: true
    // eager: true
  })
  @JoinColumn()
  currentFile?: TemplateFile;


  // shouldJoinFiles = false

  // @OneToMany(() => TemplateFile, file => file.templateType)
  // files?: TemplateFile[];
}
