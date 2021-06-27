# bitwise-options - a value packing BigInt library

This library allows you to pack **boolean** and **unsigned integer** values into a single `BigInt` value.

You may use this to:
- compactly store flags in a URL: consider `?first=true&third=true&fourth=true` vs `?flags=13` - the latter is exactly the same presented as bits in a 4-bit integer: `1101`
- pack multiple numeric values bound to `[0, 2^size in bits - 1]` into a single one

Or anything else really. Let me know (or make a PR) if you find any interesting use cases for the library - I'll include it in this README.

## Installation
`npm install bitwise-options`

or

`yarn install bitwise-options`

### Babel transpilation
If you're using Babel or any other code transpilation, you may want to disable it for the lib.
It relies on the the `**` (exponentiation) operator, which won't work with BigInt-s if transpiled to `Math.pow`.

## Usage
```javascript
import BitwiseOptions from 'bitwise-options';

// Configure available options
const options = new BitwiseOptions([
  {name: 'boolean'}, // single-bit boolean by default
  {name: 'uint_single', type: 'uint'}, // single-bit unsigned int
  {name: 'uint_3bit', type: 'uint', size: 3}, // 3-bit unsigned integer in range of [0, 7]
]);

options.read(BigInt(26)); // 11010 in binary

console.log(
  options.get('boolean'), // false
  options.get('uint_single'), // 1n
  options.get('uint_3bit'), // 6n
);

options.set('uint_3bit', BigInt(0));
console.log(
  options.get('uint_3bit'), // 0n
);

console.log(
  options.toNumber(), // 2n
  options.toString(), // '2'
);
```

The library is written in TypeScript so you may benefit from built-in typings if you use TS in your project, or just use an IDE supporting static typing, such as VSCode.

### Verbosity
Since bitwise operations and compact presentation of your options is really hard to debug, library throws errors here and there.

Watch out for those.
