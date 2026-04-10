import {createReadStream, readFileSync, readdirSync} from 'node:fs';
import {join as joinPath} from 'node:path';
import type {Readable} from 'node:stream';

type readerResult = string | object | Readable | undefined | void;
type readerArgs = string | string[] | object | RegExp | fixuraOpts
interface fixuraOpts {
  root?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  components?: (string | RegExp)[],
  reader: number
  failWhenNotFound?: boolean
}
interface Fixura {
  getFixture: (...args: readerArgs[]) => readerResult, // eslint-disable-line no-unused-vars
  getFixtures: (...args: readerArgs[]) => readerResult[] // eslint-disable-line no-unused-vars
}

export const READERS = {
  TEXT: 1,
  JSON: 2,
  STREAM: 3
};

export default function (...args): Fixura {
  const defaultOptions = {
    reader: READERS.TEXT,
    failWhenNotFound: true
  };

  const {root, reader: defaultReader, failWhenNotFound = true} = parseDefaultArgs();
  return {getFixture, getFixtures};

  function parseDefaultArgs(): fixuraOpts {
    if (args.length === 1 && typeof args[0] === 'object' && Array.isArray(args[0]) === false) {
      return {...defaultOptions, ...args[0]};
    }

    return {...defaultOptions, root: args};
  }

  function getFixture(...args: readerArgs[]): readerResult {
    const {components = [], reader: readerType} = parseArgs(args);
    const read = createReader(readerType);
    if (components.every(comp => typeof comp === 'string')) {
      const filePath = joinPath(...root, ...components);
      return read(filePath);
    }
  }

  function getFixtures(...args: readerArgs[]): readerResult[] {
    const {components = [], reader: readerType} = parseArgs(args);
    const read = createReader(readerType);
    const [filterComponent] = components.slice(-1);

    if (filterComponent && filterComponent instanceof RegExp) {
      const pathComponents = components.slice(0, -1).filter(component => typeof component === 'string');
      const dir = joinPath(...root, ...pathComponents);
      return readdirSync(dir)
        .filter(fn => filterComponent.test(fn))
        .map(fn => read(joinPath(dir, fn)));
    }

    const pathComponents = components.filter(component => typeof component === 'string')
    return [read(joinPath(...root, ...pathComponents))];
  }

  function parseArgs(args): fixuraOpts {
    if (args.length === 1 && typeof args[0] === 'object' && args[0] instanceof RegExp === false && Array.isArray(args[0]) === false) {
      return {reader: defaultReader, ...args[0]};
    }

    return {reader: defaultReader, components: args};
  }

  function createReader(context: number): (filePath: string) => readerResult { // eslint-disable-line no-unused-vars
    const readCallback = generateReader(context);
    return filePath => {
      try {
        return readCallback(filePath);
      } catch (error: Error | any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (error.code && error.code === 'ENOENT') {
          if (failWhenNotFound) {
            throw new Error(`Couldn't retrieve test fixture ${filePath}`);
          }

          return;
        }

        throw error;
      }
    };

    function generateReader(context: number) {
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

    function readText(filePath): string {
      return readFileSync(filePath, 'utf8');
    }

    function readJson(filePath): object {
      const data = readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }

    function readStream(filePath): Readable {
      return createReadStream(filePath);
    }
  }
}
