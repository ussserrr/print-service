import { Job, DoneCallback } from 'bull';

import * as print from './lib';


export default function(job: Job<print.PrintJob>, cb: DoneCallback) {
  console.log('start job processor', process.pid);
  const filledDocx = print.fillTemplate(job.data.templatePath, job.data.fillData ?? {});
  const renderedPDF = print.renderToPDF(filledDocx, job.data.renderTimeout);
  cb(null, { path: renderedPDF });
}
