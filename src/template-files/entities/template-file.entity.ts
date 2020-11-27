import { Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { TemplateType } from 'src/template-types/entities/template-type.entity';


@Entity()
export class TemplateFile {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => TemplateType, type => type.files)
  templateType!: TemplateType;

  @Column('text')
  url!: string;

  @Column()
  mimeType!: string;

  @Column({ nullable: true })
  name!: string;

  @OneToOne(() => TemplateType, currentFileOfType => currentFileOfType.currentFile, {
    nullable: true
  })
  currentFileOfType!: TemplateType;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true
  })
  updatedAt!: Date;
}
