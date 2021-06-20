import { registerAs } from '@nestjs/config';

export const config = {
  cachePath: process.env.PRINT_CACHE_PATH,  // will fallback to the system temp location if not present
  printJob: {
    timeoutMs: 60 * 1000,  // ms
    removeAfter: { minutes: 5 }  // luxon format
  },
  purgeQueueJob: {
    repeatEvery: 10 * 1000  // ms
  }
};

export default registerAs('print', () => config);
