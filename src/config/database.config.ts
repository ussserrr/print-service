import { registerAs } from '@nestjs/config';

import { TypeOrmModuleOptions } from '@nestjs/typeorm';


const config: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  username: process.env.POSTGRES_USER,
  database: process.env.POSTGRES_DB,
  synchronize: true
};

export default registerAs('database', () => config);
