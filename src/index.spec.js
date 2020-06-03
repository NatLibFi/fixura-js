/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* Loading test fixtures is as easy as ABC
*
* Copyright (C) 2019-2020 University Of Helsinki (The National Library Of Finland)
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

import fs from 'fs';
import {join as joinPath} from 'path';
import {expect} from 'chai';
import fixturesFactory, {READERS} from './index';

describe('index', () => {
  const FIXTURES_PATH = [__dirname, '..', 'test-fixtures'];

  describe('#getFixture', () => {
    it('Should get a fixture using the default reader', (index = '0') => {
      const fixturePath = [index, 'file.txt'];
      const fixture = readFile(...fixturePath);
      const {getFixture} = fixturesFactory(...FIXTURES_PATH);

      expect(getFixture(...fixturePath)).to.equal(fixture);
    });

    it('Should get a fixture using the text reader', (index = '1') => {
      const fixturePath = [index, 'file.txt'];
      const fixture = readFile(...fixturePath);
      const {getFixture} = fixturesFactory({root: FIXTURES_PATH, reader: READERS.TEXT});

      expect(getFixture(...fixturePath)).to.equal(fixture);
    });

    it('Should get a fixture using the json reader', (index = '2') => {
      const fixturePath = [index, 'file.json'];
      const fixture = JSON.parse(readFile(...fixturePath));
      const {getFixture} = fixturesFactory({root: FIXTURES_PATH, reader: READERS.JSON});

      expect(getFixture(...fixturePath)).to.eql(fixture);
    });

    it('Should get a fixture using the stream reader', async (index = '3') => {
      const fixturePath = [index, 'file.txt'];
      const expectedFixture = readFile(...fixturePath);
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
      const fixture = JSON.parse(readFile(...fixturePath));
      const {getFixture} = fixturesFactory({root: FIXTURES_PATH});

      expect(getFixture({
        components: fixturePath, reader: READERS.JSON
      })).to.eql(fixture);
    });

    it('Should use a custom reader', (index = '5') => {
      const fixturePath = [index, 'file.txt'];
      const expectedFixture = readFile(index, 'expectedFixture.txt');
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
  });

  describe('#getFixtures', () => {
    it('Should get fixtures with regular expression', (index = '6') => {
      const fixturePath = [index, 'file.txt'];
      const fixture = readFile(...fixturePath);
      const {getFixtures} = fixturesFactory(...FIXTURES_PATH);

      expect(getFixtures(index, /^file/u)).to.eql([fixture]);
    });

    it('Should get fixtures without regular expression', (index = '7') => {
      const fixturePath = [index, 'file.txt'];
      const fixture = readFile(...fixturePath);
      const {getFixtures} = fixturesFactory(...FIXTURES_PATH);

      expect(getFixtures(...fixturePath)).to.eql([fixture]);
    });
  });

  function readFile(...pathComponents) {
    const filePath = joinPath(...FIXTURES_PATH, ...pathComponents);
    return fs.readFileSync(filePath, 'utf8');
  }
});
