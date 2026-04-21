# Loading test fixtures is as easy as ABC [![NPM Version](https://img.shields.io/npm/v/@natlibfi/fixura.svg)](https://npmjs.org/package/@natlibfi/fixura)


Loading test fixtures is as easy as ABC with Fixura.

## Workflow status
| Branch | Workflow status                                                                                                                                            |
|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| main   | ![Workflow status badge for branch main](https://github.com/NatLibFi/fixura-js/actions/workflows/melinda-node-tests-and-publish.yml/badge.svg?branch=main) |
| test   | ![Workflow status badge for branch test](https://github.com/NatLibFi/fixura-js/actions/workflows/melinda-node-tests-and-publish.yml/badge.svg?branch=test) |

# Usage
## ES modules
```js
import fixturesFactory from '@natlibfi/fixura';
const {getFixture} = fixturesFactory([import.meta.dirname, '...', 'test-fixtures']);
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
    rootPath: [import.meta.dirname, '..', 'test-fixtures'],
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

## failWhenNotFound
Set **failWhenNotFound** to false to return undefined and to prevent throwing if a fixture file is not found:
```js
const {getFixture} = fixturesFactory({
    rootPath: [import.meta.dirname, '..', 'test-fixtures'],
    failWhenNotFound: false
});

const foo = getFixture('foo', 'bar.txt'); // undefined
```

## License and copyright

Copyright (c) 2019-2020, 2022-2026 **University Of Helsinki (The National Library Of Finland)**

This project's source code is licensed under the terms of **MIT** or any later version.
