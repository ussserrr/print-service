import { registerAs } from '@nestjs/config';

const config = {
  storageRootPath: '/Users/chufyrev/Documents/taxi21/print-service/storage',
  filesToKeep: 5,
  allowedFileTypes: [{
    extension: 'DOCX',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }]
};

export default registerAs('app', () => config);
