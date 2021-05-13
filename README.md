# bitwise-options - a value packing library

This library allows you to pack **boolean** and **unsigned integer** values into a single 32-bit integer value.

You may use this to:
- compactly store flags in a URL: consider `?first=true&third=true&fourth=true` vs `?flags=13` - the latter is exactly the same presented as bits in a 4-bit integer: `1101`
- pack multiple numeric values bound to `[0, 2^size in bits - 1]` into a single one

Or anything else really. Let me know (or make a PR) if you find any interesting use cases for the library - I'll include it in this README.

## Installation
`npm install bitwise-options`

or

`yarn install bitwise-options`

## Usage
```(js)
import BitwiseOptions from 'bitwise-options';

// Configure available options
const options = new BitwiseOptions([
  {name: 'boolean'}, // single-bit boolean by default
  {name: 'uint_single', type: 'uint'}, // single-bit unsigned int
  {name: 'uint_3bit', type: 'uint', size: 3}, // 3-bit unsigned integer in range of [0, 7]
]);

options.read(26); // 11010 in binary

console.log(
  options.get('boolean'), // false
  options.get('uint_single'), // 1
  options.get('uint_3bit'), // 6
);

options.set('uint_3bit', 0);
console.log(
  options.get('uint_3bit'), // 0
);

console.log(
  options.toNumber(), // 2
);
```

The library is written in TypeScript so you may benefit from built-in typings if you use TS in your project, or just use an IDE supporting static typicing, such as VSCode.

### Verbosity
Since bitwise operations and compact presentation of your options is really hard to debug, library throws errors here and there.

Watch out for those.
