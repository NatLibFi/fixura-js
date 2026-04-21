import type {ReadStream} from 'node:fs';
import {createReadStream, readFileSync, readdirSync} from 'node:fs';
import {join as joinPath} from 'node:path';

export const READERS = {
  TEXT: 1,
  JSON: 2,
  STREAM: 3
};

export default function (...args: [{root: string[], reader?: number, failWhenNotFound?: boolean}] | string[]) {
  const defaultOptions = {
    reader: READERS.TEXT,
    failWhenNotFound: true
  };

  const {root, reader: defaultReader, failWhenNotFound = true} = parseDefaultArgs(args);
  return {getFixture, getFixtures};

  //MARK: parseDefaultArgs
  function parseDefaultArgs(args: [{root: string[], reader?: number, failWhenNotFound?: boolean}] | string[]):
    ({root: string[], reader: number, failWhenNotFound?: boolean}) {
    const [firstArg] = args;
    if (args.length === 1 && typeof firstArg === 'object' && Array.isArray(firstArg) === false) {
      return {...defaultOptions, ...firstArg};
    }

    if (args.length >= 1 && args.every(arg => typeof arg === 'string')) {
      return {...defaultOptions, root: args};
    }

    throw new Error('Invalid args');
  }

  //MARK: getFixture
  function getFixture(
    ...args: [{components?: string[], reader?: number}] | string[]
  ) {
    const {components = [], reader: readerType} = parseArgs(args);
    const read = createReader(readerType);
    return read(joinPath(...root, ...components));
  }

  //MARK: getFixtures
  function getFixtures(
    ...args: [{components?: string[], reader?: number}] | [RegExp, ...string[]] | string[]
  ) {
    const {components = [], filter, reader: readerType} = parseArgs(args);
    const read = createReader(readerType);

    if (filter) {
      const dir = joinPath(...root, ...components);
      return readdirSync(dir)
        .filter(fileInDir => filter.test(fileInDir))
        .map(fileInDir => read(joinPath(dir, fileInDir)));
    }

    const pathComponents = components.filter(component => typeof component === 'string');
    return [read(joinPath(...root, ...pathComponents))];
  }

  // MARK: parseArgs
  function parseArgs(args: [{components?: string[], reader?: number}] | [RegExp, ...string[]] | string[]):
    ({reader: number, filter?: RegExp, components?: string[]}) {
    const [firstArg, ...rest] = args;

    if (args.length === 1 && typeof firstArg === 'object' && firstArg instanceof RegExp === false && Array.isArray(firstArg) === false) {
      return {reader: defaultReader, ...firstArg};
    }

    if (args.length >= 1 && firstArg instanceof RegExp) {
      const pathComponents = rest.filter(comp => typeof comp === 'string');
      return {reader: defaultReader, filter: firstArg, components: pathComponents};
    }

    const pathComponents = args.filter(comp => typeof comp === 'string');
    return {reader: defaultReader, components: pathComponents};
  }

  // MARK: createReader
  function createReader(context: number) { // eslint-disable-line no-unused-vars
    const readCallback = generateReader(context);
    return (filePath: string): string | object | ReadStream | undefined => {
      try {
        return readCallback(filePath);
      } catch (error: Error | any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (error.code && error.code === 'ENOENT') {
          if (failWhenNotFound === true) {
            throw new Error(`Couldn't retrieve test fixture ${filePath}`);
          }

          return;
        }

        throw error;
      }
    };

    // MARK: generateReader
    function generateReader(context: number):
      // eslint-disable-next-line no-unused-vars
      ((filePath: string) => string | object | ReadStream) {
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

    // MARK: readText
    function readText(filePath: string): string {
      return readFileSync(filePath, 'utf8');
    }

    // MARK: readJson
    function readJson(filePath: string): object {
      const data = readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }

    // MARK: readStream
    function readStream(filePath: string): ReadStream {
      return createReadStream(filePath);
    }
  }
}
