/**
 * The file consists of recommended Docxtemplater procedures to fill the template file
 */

import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';

const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

import * as temp from 'tmp';

import { flattenObject } from 'src/util/util';


export type PrintJob = {
  templatePath: string;
  fillData?: Record<string, any>;
  renderTimeout?: number;
};
export type PrintJobOutput = {
  path: string;
};


// The error object contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
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
  console.log(JSON.stringify({error: error}, replaceErrors));

  if (error.properties && error.properties.errors instanceof Array) {
    const errorMessages = error.properties.errors.map(function (error) {
      return error.properties.explanation;
    }).join("\n");
    console.log('errorMessages', errorMessages);
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
  // Use async version of the child_process.exec because the blocking one is causing the stack overflow
  // error (weird). The async one cannot distinguish the timeout error from other SIGKILL-caused
  // termination, though
  return new Promise<string>((resolve, reject) => child_process.exec(
    `soffice --invisible --headless --convert-to pdf --outdir ${dir} ${doc.name}`,
    { timeout: timeout ?? (30 * 1000) },
    (error, stdout, stderr) => {
      doc.removeCallback();  // we don't need the .docx file anymore, don't wait and remove it now
      if (error) {
        reject(error);
      } else {
        resolve(path.join(dir, name + '.pdf'));
      }
    })
  );
}
