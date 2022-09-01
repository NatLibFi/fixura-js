# Loading test fixtures is as easy as ABC [![NPM Version](https://img.shields.io/npm/v/@natlibfi/fixura.svg)](https://npmjs.org/package/@natlibfi/fixura)

Loading test fixtures is as easy as ABC with Fixura.

# Usage
## ES modules
```js
import fixturesFactory from '@natlibfi/fixura';
const {getFixture} = fixturesFactory(__dirname, '...', 'test-fixtures']);
const fixture = getFixture('foo.txt');

// Get multiple files using regular expressions
const fixtures = getFixtures(/.+\.txt/u);
```
## Node.js require
```js
const {default: fixturesFactory} from '@natlibfi/fixura';
const {getFixture} = fixturesFactory(__dirname, '...', 'test-fixtures');
const fixture = getFixture('foo.txt');

// Get multiple files using regular expressions
const fixtures = getFixtures(/.+\.txt/u);
```
# Configuration
## Readers
The readers are exported as `READERS`:
```js
import fixturesFactory, {READERS} from '@natlibfi/fixura'
```
Default reader can be passed in to the factory function:
```js
const {getFixture} = fixturesFactory({
    rootPath: [__dirname, '..', 'test-fixtures'],
    reader: READERS.JSON
});
```
or fixture specific reader can be defined:
```js
getFixture({components: ['foo', 'bar.txt'], reader: READERS.JSON})
```
### Built-in readers
- **TEXT**: Returns the fixture as test (**Default**)
- **JSON**: Parses the fixture as JSON and returns an object
- **STREAM**: Returns a read stream to the fixture
### Custom reader
Custom readers can be used:
```js
const {getFixture} = fixturesFactory({
    rootPath: [__dirname, '..', 'test-fixtures'],
    reader: filePath => doSomething()
});
```
or
```js
getFixture({components: ['foo', 'bar.txt'], reader: filePath => doSomething()});
```
The reader function takes one string argument which is an absolute path to the fixture file. The function can return any value which the test case can then use as appropriate.

## failWhenNotFound
Set **failWhenNotFound** to false to return undefined and to prevent throwing if a fixture file is not found:
```
const {getFixture} = fixturesFactory({
    rootPath: [__dirname, '..', 'test-fixtures'],
    failWhenNotFound: false
});

const foo = getFixture('foo', 'bar.txt'); // undefined
```

## License and copyright

Copyright (c) 2019-2020, 2022 **University Of Helsinki (The National Library Of Finland)**

This project's source code is licensed under the terms of **GNU Lesser General Public License Version 3** or any later version.
