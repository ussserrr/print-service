import { registerAs } from '@nestjs/config';

const config = {
  storageRootPath: '/Users/chufyrev/Documents/taxi21/print-service/storage'
};

export default registerAs('app', () => config);
