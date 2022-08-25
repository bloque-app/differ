import { differAll, hasChanged, isNew } from "../src/differ.js";

import assert from "assert";
import test from "node:test";

test("#differAll()", async (t) => {
  await t.test("when adding new item to array, mark it as new", () => {
    const list = differAll([{ a: 1 }]);

    list.push({ a: 2 });

    assert(isNew(list[1]));
  });

  await t.test('also supports the `hasChanged` evaluation within new objects', () => {
    const list = differAll([
      { a: 1 }
    ]);

    list.push({ a: 2 });

    assert(!isNew(list[0]));
    assert(isNew(list[1]));

    list[1].a = 3;

    assert(hasChanged(list[1]));
  })
});
