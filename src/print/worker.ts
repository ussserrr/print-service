import { Job, DoneCallback } from 'bull';

import * as print from './lib';


export default async function(job: Job<print.PrintJob>, cb: DoneCallback) {
  console.log('start job processor, pid:', process.pid);
  try {
    const filledDocx = print.fillTemplate(job.data.templatePath, job.data.fillData ?? {});
    const renderedPDF = await print.renderToPDF(filledDocx, job.data.renderTimeout);
    cb(null, { path: renderedPDF });
  } catch (error) {
    cb(error);
  }
}
