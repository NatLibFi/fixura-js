import fs from 'fs';
import {join as joinPath} from 'path';
import {describe, it} from 'node:test';
import assert from 'node:assert';
import fixturesFactory, {READERS} from './index.mjs';

describe('index', () => {
  describe('#getFixture', () => {
    const FIXTURES_PATH = [import.meta.dirname, '..', 'test-fixtures', 'getFixture'];

    it('Should get a fixture using the default reader', () => {
      const fixturePath = ['0', 'file.txt'];
      const fixture = readFile(...FIXTURES_PATH, ...fixturePath);
      const {getFixture} = fixturesFactory(...FIXTURES_PATH);

      assert.deepEqual(getFixture(...fixturePath), fixture);
    });

    it('Should get a fixture using the text reader', () => {
      const fixturePath = ['1', 'file.txt'];
      const fixture = readFile(...FIXTURES_PATH, ...fixturePath);
      const {getFixture} = fixturesFactory({root: FIXTURES_PATH, reader: READERS.TEXT});

      assert.deepEqual(getFixture(...fixturePath), fixture);
    });

    it('Should get a fixture using the json reader', () => {
      const fixturePath = ['2', 'file.json'];
      const fixture = JSON.parse(readFile(...FIXTURES_PATH, ...fixturePath));
      const {getFixture} = fixturesFactory({root: FIXTURES_PATH, reader: READERS.JSON});

      assert.deepEqual(getFixture(...fixturePath), fixture);
    });

    it('Should get a fixture using the stream reader', async () => {
      const fixturePath = ['3', 'file.txt'];
      const expectedFixture = readFile(...FIXTURES_PATH, ...fixturePath);
      const {getFixture} = fixturesFactory({root: FIXTURES_PATH, reader: READERS.STREAM});

      const stream = getFixture(...fixturePath);
      const fixture = await new Promise((resolve, reject) => {
        const chunks = [];

        stream
          .on('error', reject)
          .on('data', chunk => chunks.push(chunk))
          .on('end', () => resolve(chunks.join('')));
      });

      assert.deepEqual(fixture, expectedFixture);
    });

    it('Should use a fixture-specific reader', () => {
      const fixturePath = ['4', 'file.json'];
      const fixture = JSON.parse(readFile(...FIXTURES_PATH, ...fixturePath));
      const {getFixture} = fixturesFactory({root: FIXTURES_PATH});

      assert.deepEqual(getFixture({
        components: fixturePath, reader: READERS.JSON
      }), fixture);
    });

    it('Should use a custom reader', () => {
      const fixturePath = ['5', 'file.txt'];
      const expectedFixture = readFile(...FIXTURES_PATH, '5', 'expectedFixture.txt');
      const reader = () => expectedFixture;
      const {getFixture} = fixturesFactory({root: FIXTURES_PATH, reader});

      assert.deepEqual(getFixture(...fixturePath), expectedFixture);
    });

    it('Should throw because of an unsupported reader type', () => {
      const {getFixture} = fixturesFactory({root: FIXTURES_PATH, reader: 'foo'});
      const error = new Error('Unsupported reader type: foo');
      assert.throws(() => getFixture([]), error);
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
      assert.throws(() => getFixture('6', 'file.txt'), error);
    });
  });

  describe('#getFixtures', () => {
    const FIXTURES_PATH = [import.meta.dirname, '..', 'test-fixtures', 'getFixtures'];

    it('Should get fixtures with regular expression', () => {
      const fixturePath = ['1', 'file.txt'];
      const fixture = readFile(...FIXTURES_PATH, ...fixturePath);
      const {getFixtures} = fixturesFactory(...FIXTURES_PATH);
      assert.deepEqual(getFixtures('1', /^file/u), [fixture]);
    });

    it('Should get fixtures without regular expression', () => {
      const fixturePath = ['2', 'file.txt'];
      const fixture = readFile(...FIXTURES_PATH, ...fixturePath);
      const {getFixtures} = fixturesFactory(...FIXTURES_PATH);
      assert.deepEqual(getFixtures(...fixturePath), [fixture]);
    });
  });

  function readFile(...pathComponents) {
    const filePath = joinPath(...pathComponents);
    return fs.readFileSync(filePath, 'utf8');
  }
});
