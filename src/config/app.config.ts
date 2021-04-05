import * as path from 'path';

import { registerAs } from '@nestjs/config';


const config = {
  storageRootPath: process.env.STORAGE_ROOT_PATH || path.join(process.cwd(), 'storage'),
  filesToKeep: 5,
  allowedFileTypes: [{
    extension: 'DOCX',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }]
};

export default registerAs('app', () => config);
