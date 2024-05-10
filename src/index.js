import {join as joinPath} from 'path';
import {readFileSync, readdirSync, createReadStream} from 'fs';

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

  const {root, reader: defaultReader, failWhenNotFound = true} = parseDefaultArgs();
  return {getFixture, getFixtures};

  function parseDefaultArgs() {
    if (args.length === 1 && typeof args[0] === 'object' && Array.isArray(args[0]) === false) {
      return {...defaultOptions, ...args[0]};
    }

    return {...defaultOptions, root: args};
  }

  function getFixture(...args) {
    const {components, reader: readerType} = parseArgs(args);
    const read = createReader(readerType);
    const filePath = joinPath(...root, ...components);
    return read(filePath);
  }

  function getFixtures(...args) {
    const {components, reader: readerType} = parseArgs(args);
    const read = createReader(readerType);
    const [fileComponent] = components.slice(-1);

    if (fileComponent instanceof RegExp) {
      const dir = joinPath(...root, ...components.slice(0, -1));
      return readdirSync(dir)
        .filter(fn => fileComponent.test(fn))
        .map(fn => read(joinPath(dir, fn)));
    }

    return [read(joinPath(...root, ...components))];
  }

  function parseArgs(args) {
    if (args.length === 1 && typeof args[0] === 'object' && args[0] instanceof RegExp === false && Array.isArray(args[0]) === false) {
      return {reader: defaultReader, ...args[0]};
    }

    return {reader: defaultReader, components: args};
  }

  function createReader(context) {
    const readCallback = generateReader();
    return filePath => {
      try {
        return readCallback(filePath);
      } catch (err) {
        if (err.code && err.code === 'ENOENT') {
          if (failWhenNotFound) { // eslint-disable-line functional/no-conditional-statements
            throw new Error(`Couldn't retrieve test fixture ${filePath}`);
          }

          return;
        }

        throw err;
      }
    };

    function generateReader() {

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
      return readFileSync(filePath, 'utf8');
    }

    function readJson(filePath) {
      const data = readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }

    function readStream(filePath) {
      return createReadStream(filePath);
    }
  }
}
