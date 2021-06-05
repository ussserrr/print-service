import * as path from 'path';

import { registerAs } from '@nestjs/config';


const config = {
  storagePath: process.env.STORAGE_PATH || path.join(process.cwd(), 'storage'),
  filesToKeep: 5,  // number of files per template type
  allowedFileTypes: [{
    extension: 'DOCX',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }]
};

export default registerAs('app', () => config);
