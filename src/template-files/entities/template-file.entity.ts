import { Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { TemplateType } from 'src/template-types/entities/template-type.entity';


@Entity()
export class TemplateFile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => TemplateType)
  templateType!: TemplateType;

  @Column()
  name!: string;

  @Column()
  mimeType!: string;

  @Column({ nullable: true })  // nullable false by default
  title: string;

  @OneToOne(() => TemplateType, currentFileOfType => currentFileOfType.currentFile, {
    nullable: true
  })
  currentFileOfType?: TemplateType;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;


  get isCurrentFileOfItsType(): boolean {
    return this.currentFileOfType ? true : false;
  }
}
