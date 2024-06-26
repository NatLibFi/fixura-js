import fs from 'fs';
import {join as joinPath} from 'path';
import {expect} from 'chai';
import fixturesFactory, {READERS} from './index';

describe('index', () => {
  describe('#getFixture', () => {
    const FIXTURES_PATH = [__dirname, '..', 'test-fixtures', 'getFixture'];

    it('Should get a fixture using the default reader', (index = '0') => {
      const fixturePath = [index, 'file.txt'];
      const fixture = readFile(...FIXTURES_PATH, ...fixturePath);
      const {getFixture} = fixturesFactory(...FIXTURES_PATH);

      expect(getFixture(...fixturePath)).to.equal(fixture);
    });

    it('Should get a fixture using the text reader', (index = '1') => {
      const fixturePath = [index, 'file.txt'];
      const fixture = readFile(...FIXTURES_PATH, ...fixturePath);
      const {getFixture} = fixturesFactory({root: FIXTURES_PATH, reader: READERS.TEXT});

      expect(getFixture(...fixturePath)).to.equal(fixture);
    });

    it('Should get a fixture using the json reader', (index = '2') => {
      const fixturePath = [index, 'file.json'];
      const fixture = JSON.parse(readFile(...FIXTURES_PATH, ...fixturePath));
      const {getFixture} = fixturesFactory({root: FIXTURES_PATH, reader: READERS.JSON});

      expect(getFixture(...fixturePath)).to.eql(fixture);
    });

    it('Should get a fixture using the stream reader', async (index = '3') => {
      const fixturePath = [index, 'file.txt'];
      const expectedFixture = readFile(...FIXTURES_PATH, ...fixturePath);
      const {getFixture} = fixturesFactory({root: FIXTURES_PATH, reader: READERS.STREAM});

      const stream = getFixture(...fixturePath);
      const fixture = await new Promise((resolve, reject) => {
        const chunks = [];

        stream
          .on('error', reject)
          .on('data', chunk => chunks.push(chunk)) // eslint-disable-line functional/immutable-data
          .on('end', () => resolve(chunks.join('')));
      });

      expect(fixture).to.equal(expectedFixture);
    });

    it('Should use a fixture-specific reader', (index = '4') => {
      const fixturePath = [index, 'file.json'];
      const fixture = JSON.parse(readFile(...FIXTURES_PATH, ...fixturePath));
      const {getFixture} = fixturesFactory({root: FIXTURES_PATH});

      expect(getFixture({
        components: fixturePath, reader: READERS.JSON
      })).to.eql(fixture);
    });

    it('Should use a custom reader', (index = '5') => {
      const fixturePath = [index, 'file.txt'];
      const expectedFixture = readFile(...FIXTURES_PATH, index, 'expectedFixture.txt');
      const reader = () => expectedFixture;
      const {getFixture} = fixturesFactory({root: FIXTURES_PATH, reader});

      expect(getFixture(...fixturePath)).to.eql(expectedFixture);
    });

    it('Should throw because of an unsupported reader type', () => {
      const {getFixture} = fixturesFactory({root: FIXTURES_PATH, reader: 'foo'});
      expect(() => {
        getFixture([]);
      }).to.throw(Error, /^Unsupported reader type: foo$/u);
    });

    it('Should throw because the fixture could not be found', () => {
      const {getFixture} = fixturesFactory({root: FIXTURES_PATH});

      expect(() => {
        getFixture('foo');
      }).to.throw(Error, new RegExp(`^Couldn't retrieve test fixture ${joinPath(...FIXTURES_PATH, 'foo')}$`, 'u'));
    });

    it('Should not throw when a fixture is not found because explicitly requested', () => {
      const {getFixture} = fixturesFactory({root: FIXTURES_PATH, failWhenNotFound: false});
      expect(getFixture('foo')).to.equal(undefined);
    });

    it('Should throw because reading the fixture failed', (index = '6') => {
      const {getFixture} = fixturesFactory({root: FIXTURES_PATH, reader: READERS.JSON});

      expect(() => {
        getFixture(index, 'file.txt');
      }).to.throw(Error, /^Unexpected token/u);
    });
  });

  describe('#getFixtures', () => {
    const FIXTURES_PATH = [__dirname, '..', 'test-fixtures', 'getFixtures'];

    it('Should get fixtures with regular expression', (index = '1') => {
      const fixturePath = [index, 'file.txt'];
      const fixture = readFile(...FIXTURES_PATH, ...fixturePath);
      const {getFixtures} = fixturesFactory(...FIXTURES_PATH);

      expect(getFixtures(index, /^file/u)).to.eql([fixture]);
    });

    it('Should get fixtures without regular expression', (index = '2') => {
      const fixturePath = [index, 'file.txt'];
      const fixture = readFile(...FIXTURES_PATH, ...fixturePath);
      const {getFixtures} = fixturesFactory(...FIXTURES_PATH);

      expect(getFixtures(...fixturePath)).to.eql([fixture]);
    });
  });

  function readFile(...pathComponents) {
    const filePath = joinPath(...pathComponents);
    return fs.readFileSync(filePath, 'utf8');
  }
});
