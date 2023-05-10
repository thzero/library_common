![GitHub package.json version](https://img.shields.io/github/package-json/v/thzero/library_common)
![David](https://img.shields.io/david/thzero/library_common)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# library_common

## Requirements

### NodeJs

[NodeJs](https://nodejs.org) version 18+

### Depednencies

By default this library uses the https://github.com/ai/nanoid package for generation of long (21 length) and short (16 length) ids based on https://github.com/ai/nanoid with the default character set.

To use a  different id number generator, you can use one of the following packages:

* https://npmjs.org/package/@thzero/library_id_uuid
* https://npmjs.org/package/@thzero/library_id_shortuuid
* custom package

Include the package as dependency in your application, then call the following method

```
import IdGenerator from '<packagename>';

Utility.setIdGenerator(IdGenerator);
```

## Installation

[![NPM](https://nodei.co/npm/@thzero/library_common.png?compact=true)](https://npmjs.org/package/@thzero/library_common)

## Options

The following options can be set, but only apply to the nanoid generation or custom package.

* Utility.setIdGeneratorAlphabet - sets a custom alphabet for nanoid use, be sure to read https://zelark.github.io/nano-id-cc.
* Utility.setIdGeneratorLengthLong - sets the length of the long id generation, be sure to read https://zelark.github.io/nano-id-cc.
* Utility.setIdGeneratorLengthShort - sets the length of the short id generation, be sure to read https://zelark.github.io/nano-id-cc.
