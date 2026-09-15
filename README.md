![GitHub package.json version](https://img.shields.io/github/package-json/v/thzero/library_common)
![David](https://img.shields.io/david/thzero/library_common)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# library_common

The foundation every other `@thzero/library_*` package builds on — the `Response`
envelope, the utility belt, the data base classes and the injector.

It has no opinion about server or client. `library_common_service` adds the
service layer, `library_server` the server framework, `library_client` the
browser side; all three depend on this.

## Requirements

### NodeJs

[NodeJs](https://nodejs.org) version 22+

### Installation

[![NPM](https://nodei.co/npm/@thzero/library_common.png?compact=true)](https://npmjs.org/package/@thzero/library_common)

```
npm install @thzero/library_common
```

#### Peer dependencies

None. Direct dependencies are [nanoid](https://github.com/ai/nanoid) (through
`@thzero/library_id_nanoid`), [dayjs](https://day.js.org) and
[lodash-es](https://lodash.com) — you do not install them yourself.

## What it provides

### `response/index.js` — `Response`

The envelope **every** method in the framework returns, success or failure.

| Member | Purpose |
|---|---|
| `Response.success(correlationId, results)` | A successful response |
| `Response.error(clazz, method, message, err, code, errors, correlationId)` | A failed one |
| `Response.hasFailed(response)` / `hasSucceeded(response)` | Test one |
| `add`, `addGeneric` | Attach a field-level or generic error |
| `param`, `paramIl8n` | Build a message parameter, optionally translated |

Fields: `success`, `results`, `code`, `err`, `message`, `errors`, `params`,
`correlationId`.

**A `Response` is always truthy.** `if (!response)` is never true, and neither is
`if (!this._checkUpdate(...))`. Test with `hasFailed` / `hasSucceeded`, or the
`_hasFailed` / `_hasSucceeded` helpers on `Service` and `Repository`.

`response/extract.js` — `ExtractResponse` adds `count`, `total` and `data` for
paged results. `response/responseParam.js` — the parameter type `param` builds.

### `utility/string.js` — global `String` helpers

**Side-effecting.** Importing it installs four helpers onto the global `String`:
`capitalize`, `isNullOrEmpty`, `isString`, `trim`.

```js
import '@thzero/library_common/utility/string.js';
```

Import it **before** anything that calls them. `Utility.isDev` and much of the
framework use `String.isNullOrEmpty`, so a module graph that reaches those before
this import fails with `String.isNullOrEmpty is not a function`. The framework's
boot does this first; anything running outside boot — a test, a script — has to
do it itself.

Note that `String.url` does **not** exist. Only those four.

**`isNullOrEmpty` is `!value`, nothing more.** A whitespace string is not empty,
which is what the name says — if you want `'   '` to count, trim first. The
quirk is at the other end: because it is a plain falsy test rather than a string
test, `0` and `false` read as empty. That matters through `_enforceNotEmpty`,
which uses it:

```js
this._enforceNotEmpty('C', 'm', 0, 'count', correlationId);      // throws
this._enforceNotEmpty('C', 'm', false, 'enabled', correlationId); // throws
```

Nothing in the tree passes a number or a boolean to that family today. If you
need to guard one, use `_enforceNotNull`, which tests `null` and `undefined`
only.

### `utility/index.js` — `Utility`

| Group | Members |
|---|---|
| Ids | `generateId`, `generateLongId`, `generateShortId`, `translateToId`, `translateToShortId`, `setIdGenerator`, `setIdGeneratorAlphabet`, `setIdGeneratorLengthLong`, `setIdGeneratorLengthShort` |
| Null and type tests | `isNull`, `isNotNull`, `isObject`, `isNotObject`, `isFunction`, `isNotFunction` |
| Objects | `cloneDeep`, `isEqual`, `merge2`, `merge3`, `instantiate`, `map`, `update`, `removeNulls`, `stringify` |
| Arrays | `distinctArray`, `deleteArrayById`, `updateArrayById`, `updateArrayByObject`, `selectBlank` |
| Sorting | `sortByName`, `sortByNumber`, `sortByNumberEx`, `sortByOrder`, `sortByString`, `sortByTimestamp` |
| Urls | `formatUrl`, `formatUrlParams`, `tagToUrl` |
| Timing | `timerStart`, `timerStop`, `promiseTimeout`, `debounce` |
| Misc | `correlationId`, `randomKeyGen`, `isDev` (getter) |

`isNull(value)` is exactly `value === null || value === undefined`. It does
**not** treat an empty array or an empty string as null, so `isNotNull([])` is
`true`.

### `utility/moment.js` — `MomentUtility`

Dates and timestamps over [dayjs](https://day.js.org). `getTimestamp`,
`getTimestampSeconds`, `getTimestampLocal`, the `convertTimestamp*` family, the
`getDate*` formatters, and `getTimestampHighRes` / `getTimestampHighResNs`.

**`initDateTime()` must be called once before anything else here.** It registers
the `utc`, `localeData` and `localizedFormat` dayjs plugins; without it
`getTimestamp()` fails with `dayjs.utc is not a function`. The framework's boot
calls it; tests and scripts must call it themselves.

`getTimestampHighRes` returns `performance.timeOrigin + performance.now()` — a
real epoch millisecond value. `process.hrtime()` is neither an epoch timestamp
nor a delta on its own, and is not what these return.

### `utility/injector.js` — `Injector`

The service locator the framework resolves through: `addService`, `addSingleton`,
`getService`, `getServices`, `getSingletons`, `getInjector`.

### `utility/list/`

`DoubleLinkedList` and `PriorityQueue` as classes, plus a vendored CC0 `Queue`
constructor function.

### `utility/checksum.js` — `ChecksumUtility`

`checksumUpdateCheck`, `checksumUpdateComplete`.

### `data/` — data base classes

`Data` (`data/index.js`), `NamedData`, `BaseUser`, `BaseNews`,
`BaseSettingsUser`. These carry `id`, `createdTimestamp`, `createdUserId`,
`updatedTimestamp`, `updatedUserId` and a `map` that copies a payload onto the
instance.

`map` is **void by design** — it mutates `this` and returns nothing. A
`value.map(requested)` whose result looks discarded is correct here, unlike
`Array.prototype.map`.

### `errors/notImplemented.js` — `NotImplementedError`

What an abstract member throws.

### `constants.js`

`ErrorCodes`, `ErrorFields` and `Security` (`logicalAnd`, `logicalOr`).

## Configuration

None. This package reads no configuration.

## Id generation

By default ids come from [nanoid](https://github.com/ai/nanoid) through
`@thzero/library_id_nanoid` — 21 characters long, 16 short, default alphabet.

To use a different generator, install one and hand it over:

```js
import IdGenerator from '@thzero/library_id_shortuuid';

Utility.setIdGenerator(IdGenerator);
```

| Package | Long | Short | `translateTo*` |
|---|---|---|---|
| [library_id_nanoid](https://github.com/thzero/library_id_nanoid) | nanoid, 21 | nanoid, 16 | identity |
| [library_id_shortuuid](https://github.com/thzero/library_id_shortuuid) | uuid v4, 36 | 22 | real conversion, round trips |
| [library_id_uuid](https://github.com/thzero/library_id_uuid) | uuid v4, 36 | uuid v4, 36 | identity |

A generator is **required** — `setIdGenerator(null)` is not supported, and
`generateId` will throw rather than fall back.

Three options apply to nanoid and to any custom generator that honours them.
Read [nanoid's collision calculator](https://zelark.github.io/nano-id-cc) before
changing the lengths or the alphabet.

* `Utility.setIdGeneratorAlphabet(alphabet)`
* `Utility.setIdGeneratorLengthLong(length)`
* `Utility.setIdGeneratorLengthShort(length)`

On the server these are reached through `BootMain`'s `_initIdGenerator`,
`_initIdGeneratorAlphabet`, `_initIdGeneratorLengthLong` and
`_initIdGeneratorLengthShort` hooks rather than called directly.

## Development

```
npm run lint       # eslint .
npm run lint:fix   # eslint . --fix
npm test           # node --test "test/*.test.js"
```
