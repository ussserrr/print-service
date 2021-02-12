import { registerAs } from '@nestjs/config';

const config = {
  storageRootPath: '/Users/chufyrev/Documents/taxi21/print-service/storage',
  filesToKeep: 5
};

export default registerAs('app', () => config);
