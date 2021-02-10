import { registerAs } from '@nestjs/config';

import * as Bull from 'bull';

import redisConfig from './redis';


const config: Bull.QueueOptions = {
  prefix: 'print-service:queue',
  redis: redisConfig
};

export default registerAs('queue', () => config);
