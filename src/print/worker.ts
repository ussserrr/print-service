import { Logger } from '@nestjs/common';

import { Job, DoneCallback } from 'bull';

import * as print from './lib';


export default async function(job: Job<print.PrintJob>, cb: DoneCallback) {
  const logger = new Logger('PrintWorker');
  logger.log('Start worker for job: ' + job.id);

  try {
    const filledDocx = print.fillTemplate(job.data.templatePath, job.data.fillData ?? {});
    const renderedPDF = await print.renderToPDF(filledDocx, job.data.renderTimeout);
    cb(null, { path: renderedPDF });
  } catch (error) {
    cb(error);
  }
}
