# Loading test fixtures is as easy as ABC [![NPM Version](https://img.shields.io/npm/v/@natlibfi/fixura.svg)](https://npmjs.org/package/@natlibfi/fixura)

Fixura loads test fixtures.

## Workflow status
| Branch | Workflow status                                                                                                                                            |
|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| main   | ![Workflow status badge for branch main](https://github.com/NatLibFi/fixura-js/actions/workflows/melinda-node-tests-and-publish.yml/badge.svg?branch=main) |
| test   | ![Workflow status badge for branch test](https://github.com/NatLibFi/fixura-js/actions/workflows/melinda-node-tests-and-publish.yml/badge.svg?branch=test) |

# Usage

## ES modules

The factory takes the fixture root as one or more path components. It returns `{getFixture, getFixtures}`:

```js
import fixturesFactory from '@natlibfi/fixura';
const {getFixture, getFixtures} = fixturesFactory(import.meta.dirname, '..', 'test-fixtures');

// Load a single fixture
const fixture = getFixture('foo.txt');

// Load all .txt files in one directory
const fixtures = getFixtures(/\.txt$/u, 'some-dir');
```

You can also pass the root as an options object. See [Configuration](#configuration):

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

The function returns `{getFixture, getFixtures}`.

## getFixture(components, ...components) | getFixture({components, reader})

Loads a single fixture. The path uses one or more components joined to the root. A per-call reader can override the factory default in the object form.

The function returns a `string` (TEXT), an `object` (JSON), or a `ReadStream` (STREAM). See [Readers](#readers).

## getFixtures(regex, ...dirComponents) | getFixtures(components, ...components)

Loads multiple fixtures. The function always returns an array.

- **With a regex**: Lists the directory given by `dirComponents`. It loads every entry whose file name matches the regex. Matching uses entry names only, not joined paths. It does not recurse into subdirectories. The array can be empty if nothing matches.
- **Without a regex**: Loads the single fixture from the path components. It returns the fixture as a one-element array.

# Configuration

## Readers

The readers are exported as `READERS`:

```js
import fixturesFactory, {READERS} from '@natlibfi/fixura'
```

Pass a default reader to the factory:

```js
const {getFixture} = fixturesFactory({
    root: [import.meta.dirname, '..', 'test-fixtures'],
    reader: READERS.JSON
});
```

Set a fixture-specific reader:

```js
getFixture({components: ['foo', 'bar.json'], reader: READERS.JSON})
```

### Built-in readers

- **TEXT**: Returns the fixture as text. This is the default reader.
- **JSON**: Parses the fixture as JSON. Returns an object.
- **STREAM**: Returns a read stream to the fixture. The stream emits `error` asynchronously. Always attach an `error` listener.

CAUTION: `failWhenNotFound` does not apply to streams. A missing file returns a `ReadStream` that emits `ENOENT` as an `error` event. This is an uncaught exception if no listener exists.

## failWhenNotFound

Set `failWhenNotFound` to `false` to prevent the function from throwing when a fixture file is not found. The function returns `undefined` instead:

```js
const {getFixture} = fixturesFactory({
    root: [import.meta.dirname, '..', 'test-fixtures'],
    failWhenNotFound: false
});

const foo = getFixture('foo', 'bar.txt'); // undefined
```

Only `ENOENT` (file not found) is suppressed. Other read errors, such as invalid JSON, always throw. Streams are not covered.

## License and copyright

Copyright (c) 2019-2020, 2022-2026 **University Of Helsinki (The National Library Of Finland)**

This project uses the MIT license.
