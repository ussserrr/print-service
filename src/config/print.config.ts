import { registerAs } from '@nestjs/config';


export const PRINT_QUEUE_NAME = 'print';
export const PRINT_JOB_NAME = 'print';
export const PURGE_QUEUE_JOB_NAME = 'purge-queue';

const config = {
  cachePath: process.env.PRINT_CACHE_PATH,  // will fallback to the system temp location if not present
  printJob: {
    timeoutMs: 60 * 1000,
    removeAfter: { minutes: 5 }  // luxon format
  },
  purgeQueueJob: {
    repeatEveryMs: 10 * 1000
  }
};

export default registerAs('print', () => config);
