import type {ReadStream} from 'node:fs';
import {createReadStream, readFileSync, readdirSync} from 'node:fs';
import {join as joinPath} from 'node:path';

export const READERS: {readonly TEXT: 1, readonly JSON: 2, readonly STREAM: 3} = {
  TEXT: 1,
  JSON: 2,
  STREAM: 3
};

export type Reader = (typeof READERS)[keyof typeof READERS];

const DEFAULT_OPTIONS = {
  reader: READERS.TEXT,
  failWhenNotFound: true
};

export default function fixtureFactory(...args: ({root?: string[], reader?: number, failWhenNotFound?: boolean} | string)[]) {
  const {root = [], reader: defaultReader, failWhenNotFound = true} = parseDefaultArgs(args);
  return {getFixture, getFixtures};

  //MARK: parseDefaultArgs
  function parseDefaultArgs(args: ({root?: string[], reader?: number, failWhenNotFound?: boolean} | string)[]):
    ({root?: string[], reader: number, failWhenNotFound?: boolean}) {
    const [firstArg] = args;

    if (args.length === 1 && typeof firstArg === 'object' && Array.isArray(firstArg) === false) {
      return {...DEFAULT_OPTIONS, ...firstArg};
    }

    if (args.length >= 1 && args.every(arg => typeof arg === 'string')) {
      return {...DEFAULT_OPTIONS, root: args};
    }

    throw new Error('Invalid args');
  }

  //MARK: getFixture
  function getFixture(
    ...args: [{components?: string[], reader?: number}] | string[]
  ) {
    const {components = [], reader: readerType} = parseArgs(args, defaultReader);
    const read = createReader(readerType, failWhenNotFound);
    return read(joinPath(...root, ...components));
  }

  //MARK: getFixtures
  function getFixtures(
    ...args: [{components?: string[], reader?: number}] | [RegExp, ...string[]] | string[]
  ) {
    const {components = [], filter, reader: readerType} = parseArgs(args, defaultReader);
    const read = createReader(readerType, failWhenNotFound);

    if (filter) {
      const dir = joinPath(...root, ...components);
      return readdirSync(dir)
        .filter(fileInDir => filter.test(fileInDir))
        .map(fileInDir => read(joinPath(dir, fileInDir)));
    }

    const pathComponents = components.filter(component => typeof component === 'string');
    return [read(joinPath(...root, ...pathComponents))];
  }

}

// MARK: parseArgs
function parseArgs(
  args: [{components?: string[], reader?: number}] | [RegExp, ...string[]] | string[],
  defaultReader: number
): ({reader: number, filter?: RegExp, components?: string[]}) {
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

//MARK: isReader
function isReader(context: number): context is Reader {
  return context === READERS.TEXT || context === READERS.JSON || context === READERS.STREAM;
}

//MARK: isEnoent
function isEnoent(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}

//MARK: createReader
function createReader(context: number, failWhenNotFound: boolean):
  // eslint-disable-next-line no-unused-vars
  ((filePath: string) => string | object | ReadStream | undefined) {
  if (isReader(context) === false) {
    throw new Error(`Unsupported reader type: ${context}`);
  }

  const readCallback = generateReader(context);

  return (filePath: string): string | object | ReadStream | undefined => {
    try {
      return readCallback(filePath);
    } catch (error) {
      if (isEnoent(error)) {
        if (failWhenNotFound === true) {
          throw new Error(`Couldn't retrieve test fixture ${filePath}`);
        }

        return;
      }

      throw error;
    }
  };
}

//MARK: generateReader
function generateReader(context: Reader):
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

  const _exhaustive: never = context;
  throw new Error(`Unsupported reader type: ${String(_exhaustive)}`);
}

//MARK: readText
function readText(filePath: string): string {
  return readFileSync(filePath, 'utf8');
}

//MARK: readJson
function readJson(filePath: string): object {
  const data = readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

//MARK: readStream
function readStream(filePath: string): ReadStream {
  return createReadStream(filePath);
}
