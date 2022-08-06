# Differ

[![Check](https://github.com/bloque-app/differ/actions/workflows/check.yml/badge.svg)](https://github.com/bloque-app/differ/actions/workflows/check.yml)

This library allows wrapping up objects, to track whether they have changed or
not. It uses [`jsum`](github.com/fraunhoferfokus/JSum) to calculate the checksum
of an object.

## Installation

This library should be able to run under any Node.js version, but we strongly
encourage using the latest LTS version, or more recent.

```sh
npm install @bloque/differ
```

## Usage

```js
import { differ, hasChanged } from "@bloque/differ";

const target = differ({
  a: 1,
  b: "orange",
});

console.log(hasChanged(target)); // false

a = 2;

console.log(hasChanged(target)); // true

a = 1;

console.log(hasChanged(target)); // false
```

It also supports managing lists, using the `differAll` method, to determine
whether the items in the list are new.

```js
import { differAll, hasChanged, isNew } from "@bloque/differ";

const list = differAll([
  { a: 1 },
]);

list.push({ a: 2 });

console.log(isNew(list[0])); // false
console.log(isNew(list[1])); // true

list[1].a = 3;

console.log(hasChanged(list[1])); // true
```

## Development

### Local setup

To setup in your local machine, you'll need the latest version of Node.js.

```sh
git clone https://github.com/bloque-app/differ.git
cd differ
npm install
npm run build
```
### Testing

To check tests, run:

```sh
npm test
```
