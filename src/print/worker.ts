import { Logger } from '@nestjs/common';

import type { Job, DoneCallback } from 'bull';

import * as lib from './lib';


const logger = new Logger('PrintWorker');


export default async function(job: Job<lib.PrintJob>, done: DoneCallback) {
  logger.log('Serving the job: ' + job.id);

  try {
    const filledDocx = lib.fillTemplate(job.data.templatePath, job.data.fillData ?? {});
    const renderedPDF = await lib.renderToPDF(filledDocx);
    done(null, { path: renderedPDF });
  } catch (error) {
    done(error);
  }
}
