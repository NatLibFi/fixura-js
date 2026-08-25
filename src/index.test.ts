import fs, {ReadStream} from 'node:fs';
import {join as joinPath} from 'node:path';
import {describe, it} from 'node:test';
import assert from 'node:assert';
import fixturesFactory, {READERS} from './index.ts';

describe('index', () => {
  describe('#getFixture', () => {
    const FIXTURES_PATH = [import.meta.dirname, '..', 'test-fixtures', 'getFixture'];

    it('Should get a fixture using the default reader', () => {
      const fixturePath = ['0', 'file.txt'];
      const fixture = readFile(...FIXTURES_PATH, ...fixturePath);
      const {getFixture} = fixturesFactory(...FIXTURES_PATH);

      assert.deepStrictEqual(getFixture(...fixturePath), fixture);
    });

    it('Should get a fixture using the text reader', () => {
      const fixturePath = ['1', 'file.txt'];
      const fixture = readFile(...FIXTURES_PATH, ...fixturePath);
      const {getFixture} = fixturesFactory({root: FIXTURES_PATH, reader: READERS.TEXT});

      assert.deepStrictEqual(getFixture(...fixturePath), fixture);
    });

    it('Should get a fixture using the json reader', () => {
      const fixturePath = ['2', 'file.json'];
      const fixture = JSON.parse(readFile(...FIXTURES_PATH, ...fixturePath));
      const {getFixture} = fixturesFactory({root: FIXTURES_PATH, reader: READERS.JSON});

      assert.deepStrictEqual(getFixture(...fixturePath), fixture);
    });

    it('Should get a fixture using the stream reader', async () => {
      const fixturePath = ['3', 'file.txt'];
      const expectedFixture = readFile(...FIXTURES_PATH, ...fixturePath);
      const {getFixture} = fixturesFactory({root: FIXTURES_PATH, reader: READERS.STREAM});

      const stream = getFixture(...fixturePath);


      const fixture = await new Promise((resolve, reject) => {
        const chunks: string[] = [];
        if (stream && stream instanceof ReadStream) {
          stream
            .on('data', (chunk: string) => chunks.push(chunk))
            .on('end', () => resolve(chunks.join('')))
            .on('error', (error: Error) => {
              console.log(error); // eslint-disable-line no-console
              return reject;
            });
        }
      });

      assert.deepStrictEqual(fixture, expectedFixture);
    });

    it('Should use a fixture-specific reader', () => {
      const fixturePath = ['4', 'file.json'];
      const fixture = JSON.parse(readFile(...FIXTURES_PATH, ...fixturePath));
      const {getFixture} = fixturesFactory({root: FIXTURES_PATH});

      assert.deepStrictEqual(getFixture({
        components: fixturePath, reader: READERS.JSON
      }), fixture);
    });

    it('Should throw because of an unsupported reader type', () => {
      const {getFixture} = fixturesFactory({root: FIXTURES_PATH, reader: 0});
      const expectedError = new Error('Unsupported reader type: 0');
      assert.throws(() => getFixture(), expectedError);
    });

    it('Should throw because the fixture could not be found', () => {
      const {getFixture} = fixturesFactory({root: FIXTURES_PATH});
      const error = new Error(`Couldn't retrieve test fixture ${joinPath(...FIXTURES_PATH, 'foo')}`);
      assert.throws(() => getFixture('foo'), error);
    });

    it('Should not throw when a fixture is not found because explicitly requested', () => {
      const {getFixture} = fixturesFactory({root: FIXTURES_PATH, failWhenNotFound: false});
      assert.equal(getFixture('foo'), undefined);
    });

    it('Should throw because reading the fixture failed', () => {
      const {getFixture} = fixturesFactory({root: FIXTURES_PATH, reader: READERS.JSON});
      const error = new SyntaxError(`Unexpected token 'o', "foobar" is not valid JSON`);

      assert.throws(() => getFixture('5', 'file.txt'), error);
    });
  });

  describe('#getFixtures', () => {
    const FIXTURES_PATH = [import.meta.dirname, '..', 'test-fixtures', 'getFixtures'];

    it('Should get fixtures with regular expression', () => {
      const fixturePath = ['1', 'file.txt'];
      const fixture = readFile(...FIXTURES_PATH, ...fixturePath);
      const {getFixtures} = fixturesFactory(...FIXTURES_PATH);

      assert.deepStrictEqual(getFixtures(/^file/u, '1'), [fixture]);
    });

    it('Should get fixtures without regular expression', () => {
      const fixturePath = ['2', 'file.txt'];
      const fixture = readFile(...FIXTURES_PATH, ...fixturePath);
      const {getFixtures} = fixturesFactory(...FIXTURES_PATH);

      assert.deepStrictEqual(getFixtures(...fixturePath), [fixture]);
    });
  });

  function readFile(...pathComponents) {
    const filePath = joinPath(...pathComponents);
    return fs.readFileSync(filePath, 'utf8');
  }
});
