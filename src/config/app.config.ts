import * as path from 'path';

import { registerAs } from '@nestjs/config';


export const config = {
  port: process.env.NODE_PORT ? parseInt(process.env.NODE_PORT) : 4000,
  urlPrefix: process.env.URL_PREFIX || '/api',
  storagePath: process.env.STORAGE_PATH || path.join(process.cwd(), 'storage'),
  filesToKeep: 5,  // number of files per template type
  allowedFileTypes: [{
    extension: 'DOCX',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }]
};

export default registerAs('app', () => config);
