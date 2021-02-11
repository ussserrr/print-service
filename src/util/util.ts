import * as path from 'path';
import * as fs from 'fs';

import * as _ from 'lodash';

import { ruToEn } from './transliterate/ru-to-en';


type PathType = 'file' | 'dir';


async function getUniqueNameFromTitle(parentPath: string, title: string, pathType: 'file', extension: string): Promise<string>;
async function getUniqueNameFromTitle(parentPath: string, title: string, pathType: 'dir'): Promise<string>;
async function getUniqueNameFromTitle(parentPath: string, title: string, pathType: PathType, extension?: string): Promise<string>
{
  let basename: string;
  if (pathType === 'dir') {
    basename = title;
  } else if (pathType === 'file') {
    if (title.endsWith(extension!)) {
      basename = path.basename(title, extension);
    } else {
      basename = title;
    }
  }

  let name = ruToEn(basename!)  // transliterate
    .replace(/[- ,.:]/g, '_')  // replace some common symbols to _
    .replace(/[^\w]/g, '')  // leave only alphanumerical and _
    .toLowerCase();

  const nameExists = await new Promise<boolean>(resolve =>
    fs.access(
      path.join(parentPath, name + (extension ?? '')),
      err => resolve(err ? false : true))
  );
  if (nameExists) {
    // In case the path does somehow already exist, generate new name
    name = name + '_' + new Date().valueOf();  // use current date as randomization factor
  }

  name = name + (extension ?? '');

  return name;
}


interface FlattenObjectOpts {
  out: object,
  prefix: string,
  sep: string
}

function flattenObject(o: object, opts: FlattenObjectOpts = {
  out: {},
  prefix: '',
  sep: '.'
}) {
  for (const key in o) {
    const val = o[key];
    if (_.isObject(val) && !_.isEmpty(val)) {
      flattenObject(val, {
        out: opts.out,
        prefix: opts.prefix.length ? (opts.prefix + opts.sep + key) : key,
        sep: opts.sep
      });
    } else {
      if (opts.prefix.length) {
        opts.out[opts.prefix + opts.sep + key] = val;
      } else {
        opts.out[key] = val;
      }
    }
  }
  return opts.out;
}


export {
  getUniqueNameFromTitle,
  flattenObject
};
