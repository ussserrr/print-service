import { registerAs } from '@nestjs/config';

import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { TemplateFile } from 'src/template-files/entities/entity';
import { TemplateType } from 'src/template-types/entities/entity';

const config: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  username: 'chufyrev',
  database: 'chufyrev',
  synchronize: true,
  entities: [
    TemplateFile,
    TemplateType
  ]
};

export default registerAs('database', () => config);
