import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { TemplateFile } from 'src/template-files/entities/template-file.entity';


@Entity()
@Unique(['currentFile'])
export class TemplateType {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ default: true })
  active!: boolean;

  @Column({
    nullable: false,
    update: false
  })
  folder!: string;

  @OneToMany(() => TemplateFile, file => file.templateType)
  files!: TemplateFile[];

  @OneToOne(() => TemplateFile, currentFile => currentFile.currentFileOfType, {
    cascade: true,
    // eager: true
  })
  @JoinColumn()
  currentFile!: TemplateFile;
}
