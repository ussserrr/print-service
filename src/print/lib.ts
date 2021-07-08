/**
 * The file consists of recommended Docxtemplater procedures to fill the template file
 */

import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';

import { Logger } from '@nestjs/common';

const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

import * as temp from 'tmp';

import { flattenObject } from 'src/util/util';


export type PrintJob = {
  templatePath: string;
  userId: number;
  fillData?: Record<string, any>;
};
export type PrintJobOutput = {
  path: string;
};


const DEFAULT_JOB_TIMEOUT = 60 * 1000;  // ms
const logger = new Logger('PrintLib');


// The error object contains additional information when logged with JSON.stringify
// (it contains a properties object containing all suberrors).
function replaceErrors(key, value) {
  if (value instanceof Error) {
    return Object.getOwnPropertyNames(value).reduce(function(error, key) {
      error[key] = value[key];
      return error;
    }, {});
  }
  return value;
}

function errorHandler(error) {
  logger.error(JSON.stringify({ error: error }, replaceErrors));

  if (error.properties && error.properties.errors instanceof Array) {
    const errorMessages = error.properties.errors.map(e => e.properties.explanation).join('\n');
    logger.error(errorMessages);
    // errorMessages is a humanly readable message looking like this :
    // 'The tag beginning with "foobar" is unopened'
  }
  throw error;
}


export function fillTemplate(inputPath: string, fillData: Record<string, any>): temp.FileResult {
  // Load the docx file as a binary
  const content = fs.readFileSync(path.resolve(inputPath), 'binary');

  const zip = new PizZip(content);
  let doc;
  try {
    doc = new Docxtemplater(zip);
  } catch (error) {
    // Catch compilation errors (errors caused by the compilation of the template : misplaced tags)
    errorHandler(error);
  }

  doc.setData(flattenObject(fillData));

  try {
    doc.render();
  } catch (error) {
    // Catch rendering errors (errors relating to the rendering of the template : angularParser throws an error)
    errorHandler(error);
  }

  // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
  const docxBuffer: Buffer = doc.getZip().generate({ type: 'nodebuffer' });

  const tempFile = temp.fileSync({
    postfix: '.docx',
    tmpdir: process.env.PRINT_CACHE_PATH  // will fallback to the system one if not present
  });
  fs.writeFileSync(tempFile.fd, docxBuffer);

  return tempFile;
}


export function renderToPDF(doc: temp.FileResult, timeout?: number) {
  const { dir, name } = path.parse(doc.name);
  const outputPDF = path.join(dir, name + '.pdf');

  // 'sleep 3 && exit -1' - to test an error
  // 'sleep 90' - to test a timeout
  const command = `soffice --invisible --headless --convert-to pdf --outdir ${dir} ${doc.name}`;
  const options = { timeout: timeout ?? DEFAULT_JOB_TIMEOUT };

  // Use async version of the child_process.exec because the blocking one is causing the stack overflow
  // error (weird). The async one cannot distinguish the timeout error from other SIGKILL-caused
  // termination, though
  return new Promise<string>((resolve, reject) => child_process.exec(command, options,
    (error, stdout, stderr) => {
      doc.removeCallback();  // we don't need the .DOCX file anymore

      if (error) {
        reject(error);
      } else {
        try {
          if (fs.statSync(outputPDF).size <= 0) {
            throw new Error('Output PDF file is empty');
          }
          resolve(outputPDF);
        } catch (error) {
          reject(error);
        }
      }
    })
  );
}
