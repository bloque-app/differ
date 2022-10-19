# Differ

[![Check](https://github.com/bloque-app/differ/actions/workflows/check.yml/badge.svg)](https://github.com/bloque-app/differ/actions/workflows/check.yml)

This library allows wrapping up objects to track whether they have changed or
not. It uses [`jsum`](github.com/fraunhoferfokus/JSum) to calculate the checksum
of an object.

## Installation

This library should be able to run under any Node.js version, but we strongly
encourage using the latest LTS version or a more recent one.

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

### `differAll`

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

### Serialization

If needed, it's possible to use the methods inside `Serializers` to save a
differ object so you can store it outside your program and then rebuild it to
match the state it was in before.

```ts
import { Serializers } from "@bloque/differ";

const target = differ({
  a: 1,
  b: 2,
});

target.b = 3;

const serialized = JSON.stringify(target, Serializers.replacer);
const reconstructed = JSON.stringify(target, Serializers.reviver);

console.log(hasChanged(reconstructed)); // true

target.b = 2;
console.log(hasChanged(reconstructed)); // true
reconstructed.b = 2;
console.log(hasChanged(reconstructed)); // false
```

## Development

### Local setup

To set it up on your local machine, you'll need the latest version of Node.js.

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
