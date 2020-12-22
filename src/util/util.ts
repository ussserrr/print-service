import * as path from 'path';
import * as fs from 'fs';

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

export { getUniqueNameFromTitle };
