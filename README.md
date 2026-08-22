# Loading test fixtures is as easy as ABC [![NPM Version](https://img.shields.io/npm/v/@natlibfi/fixura.svg)](https://npmjs.org/package/@natlibfi/fixura)


Loading test fixtures is as easy as ABC with Fixura.

## Workflow status
| Branch | Workflow status                                                                                                                                            |
|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| main   | ![Workflow status badge for branch main](https://github.com/NatLibFi/fixura-js/actions/workflows/melinda-node-tests-and-publish.yml/badge.svg?branch=main) |
| test   | ![Workflow status badge for branch test](https://github.com/NatLibFi/fixura-js/actions/workflows/melinda-node-tests-and-publish.yml/badge.svg?branch=test) |

# Usage
## ES modules

The factory takes the fixture root as one or more path components and returns `{getFixture, getFixtures}`:

```js
import fixturesFactory from '@natlibfi/fixura';
const {getFixture, getFixtures} = fixturesFactory(import.meta.dirname, '..', 'test-fixtures');

// Load a single fixture
const fixture = getFixture('foo.txt');

// Load all .txt files in one directory
const fixtures = getFixtures(/\.txt$/u, 'some-dir');
```

The root can also be passed as an options object (see [Configuration](#configuration)):

```js
const {getFixture} = fixturesFactory({
    root: [import.meta.dirname, '..', 'test-fixtures'],
});
```

# API

## fixturesFactory(...)

Two call shapes:

- **Variadic root components**: `fixturesFactory(dir, '..', 'test-fixtures')`
- **Options object**: `fixturesFactory({root, reader, failWhenNotFound})`

Returns `{getFixture, getFixtures}`.

## getFixture(components, ...components) | getFixture({components, reader})

Loads a single fixture. The path is one or more path components joined onto the root. A per-call reader can override the factory default with the object form.

Returns a `string` (TEXT), an `object` (JSON), or a `ReadStream` (STREAM) — see [Readers](#readers).

## getFixtures(regex, ...dirComponents) | getFixtures(components, ...components)

Loads multiple fixtures. **Always returns an array.**

- **With a regex**: lists the single directory given by `dirComponents` and loads every entry whose **file name** matches. Matching is on entry names only, not on joined paths, and it does not recurse into subdirectories. The returned array may be empty if nothing matches.
- **Without a regex**: loads the single fixture given by the path components and returns it as a one-element array.

# Configuration

## Readers
The readers are exported as `READERS`:
```js
import fixturesFactory, {READERS} from '@natlibfi/fixura'
```
Default reader can be passed in to the factory function:
```js
const {getFixture} = fixturesFactory({
    root: [import.meta.dirname, '..', 'test-fixtures'],
    reader: READERS.JSON
});
```
or fixture specific reader can be defined:
```js
getFixture({components: ['foo', 'bar.json'], reader: READERS.JSON})
```
### Built-in readers
- **TEXT**: Returns the fixture as text (**Default**)
- **JSON**: Parses the fixture as JSON and returns an object
- **STREAM**: Returns a read stream to the fixture. The stream emits `error` asynchronously, so always attach an `error` listener. Note that **failWhenNotFound does not apply to streams**: a missing file returns a `ReadStream` that emits `ENOENT` as an `error` event, which is an uncaught exception if nobody listens.

## failWhenNotFound
Set **failWhenNotFound** to false to return undefined and to prevent throwing if a fixture file is not found:
```js
const {getFixture} = fixturesFactory({
    root: [import.meta.dirname, '..', 'test-fixtures'],
    failWhenNotFound: false
});

const foo = getFixture('foo', 'bar.txt'); // undefined
```
Only **ENOENT** (file not found) is suppressed. Other read errors, such as invalid JSON, always throw. As noted above, streams are not covered.

## License and copyright

Copyright (c) 2019-2020, 2022-2026 **University Of Helsinki (The National Library Of Finland)**

This project's source code is licensed under the terms of **MIT** or any later version.
