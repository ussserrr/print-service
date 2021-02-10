import { registerAs } from '@nestjs/config';

export const config = {
  printJob: {
    timeout: 30 * 1000,  // ms
    removeAfter: { minutes: 3 }  // luxon format
  },
  purgeQueueJob: {
    repeatEvery: 10 * 1000  // ms
  }
};

export default registerAs('print', () => config);
