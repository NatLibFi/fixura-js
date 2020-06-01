/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* Loading test fixtures is as easy as ABC
*
* Copyright (C) 2019 University Of Helsinki (The National Library Of Finland)
*
* This file is part of fixura-js
*
* fixura-js program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Lesser General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* fixura-js is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/

import path from 'path';
import fs from 'fs';

export const READERS = {
  TEXT: 1,
  JSON: 2,
  STREAM: 3
};

export default function (...args) {
  const defaultOptions = {
    reader: READERS.TEXT,
    failWhenNotFound: true
  };

  const {root, reader: defaultReader, failWhenNotFound = true} = parseArgs();
  return {getFixture};

  function parseArgs() {
    if (args.length === 1 && typeof args[0] === 'object' && Array.isArray(args[0]) === false) {
      return {...defaultOptions, ...args[0]};
    }

    return {...defaultOptions, root: args};
  }

  function getFixture(...args) {
    const {components, reader: readerType} = parseArgs();
    const read = getReader(readerType);
    const filePath = path.join(...root, ...components);

    try {
      return read(filePath);
    } catch (err) {
      if (err.code && err.code === 'ENOENT' && failWhenNotFound) { // eslint-disable-line functional/no-conditional-statement
        throw new Error(`Couldn't retrieve test fixture ${filePath}`);
      }
    }

    function parseArgs() {
      if (args.length === 1 && typeof args[0] === 'object' && Array.isArray(args[0]) === false) {
        return {reader: defaultReader, ...args[0]};
      }

      return {reader: defaultReader, components: args};
    }

    function getReader(context) {
      if (typeof context === 'function') {
        return context;
      }

      if (context === READERS.TEXT) {
        return readText;
      }

      if (context === READERS.JSON) {
        return readJson;
      }

      if (context === READERS.STREAM) {
        return readStream;
      }

      throw new Error(`Unsupported reader type: ${context}`);
    }

    function readText(filePath) {
      return fs.readFileSync(filePath, 'utf8');
    }

    function readJson(filePath) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }

    function readStream(filePath) {
      return fs.createReadStream(filePath);
    }
  }
}
