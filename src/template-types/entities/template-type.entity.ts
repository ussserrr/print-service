import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { TemplateFile } from 'src/template-files/entities/template-file.entity';


export enum Owner {
  DRIVER = 'driver',
  CAR = 'car'
}

@Entity()
@Unique(['currentFile'])  // TODO: currentFile also should belong to [files]
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

  @Column({ default: true })
  active: boolean;

  @Column({ update: false })
  folder: string;

  @OneToOne(() => TemplateFile, currentFile => currentFile.currentFileOfType, {
    cascade: true,
    nullable: true
    // eager: true
  })
  @JoinColumn()
  currentFile?: TemplateFile;


  // @OneToMany(() => TemplateFile, file => file.templateType)
  // files?: TemplateFile[];
}
