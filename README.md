![GitHub package.json version](https://img.shields.io/github/package-json/v/thzero/library_common)
![David](https://img.shields.io/david/thzero/library_common)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# library_common

## Requirements

### NodeJs

[NodeJs](https://nodejs.org) version 18+

### Depednencies

You can use a different id number generator, such as one of the following packages:

* https://npmjs.org/package/@thzero/library_id_nanoid
* https://npmjs.org/package/@thzero/library_id_shortuuid

Include the package as dependency in your application, then call the following method

```
import IdGenerator from '<packagename>';

Utility.setIdGenerator(IdGenerator);
```

## Installation

[![NPM](https://nodei.co/npm/@thzero/library_common.png?compact=true)](https://npmjs.org/package/@thzero/library_common)