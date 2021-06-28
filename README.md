# magipack - a value packing library

Magipack is a tiny library with absolutely no dependencies and [good test coverage](./src/index.test.ts) that allows you to pack any (well, theoretically any) number of **boolean** and **integer** values into a single `BigInt` value.

You may use this to:
- compactly store flags in a URL: consider `?first=true&third=true&fourth=true` vs `?flags=13` - the latter is exactly the same presented as bits in a 4-bit integer: `1101`
- pack multiple numeric values bound to `[0, 2^size in bits - 1]` into a single one

Or anything else really. Let me know (or make a PR) if you find any interesting use cases for the library - I'll include it in this README.

## Installation
`npm install magipack`

or

`yarn install magipack`

### Runtime requirements
Library depends on `BigInt` and `**` (exponentiation) operator support.

If you're using Babel or any other code transpilation, you may want to disable it for the lib, which won't work with BigInt-s if `**` is transpiled to `Math.pow` calls.

## Supported values

- Booleans: `type: 'bool', size: 1`
- Unsigned integers: `type: 'uint', size: <number>`
- Signed integers: `type: 'sint', size: <number>`

Sizes are in bits.

## Usage
```javascript
import Magipack from 'magipack';

// Configure available options
const magipack = new Magipack([
  {name: 'boolean', type: 'bool', size: 1},
  {name: 'uint_single', type: 'uint', size: 1}, // single-bit unsigned int
  {name: 'uint_3bit', type: 'uint', size: 3}, // 3-bit unsigned integer in range of [0, 7]
  {name: 'signed_4bit', type: 'sint', size: 4}, // 3-bit signed int + 1 bit per sign
]);

magipack.read(BigInt(314)); // 1001,110,1,0 in binary - commas split values

console.log(
  magipack.get('boolean'), // false
  magipack.get('uint_single'), // 1n
  magipack.get('uint_3bit'), // 6n
  magipack.get('signed_4bit'), // -1n
);

magipack.set('uint_3bit', BigInt(0));
console.log(
  magipack.get('uint_3bit'), // 0n
);

console.log(
  magipack.toNumber(), // 290n
  magipack.toString(), // '290'
);
```

The library is written in TypeScript so you may benefit from built-in typings if you use TS in your project, or just use an IDE supporting static typing, such as VSCode.

### Verbosity
Since bitwise operations and compact presentation of your options is really hard to debug, library throws errors here and there.

Watch out for those.
