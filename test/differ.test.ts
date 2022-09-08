import { differ, hasChanged } from "../src/differ.js";

import assert from "assert";
import test from "node:test";

test("#differ()", async (t) => {
  await t.test("when inner field changes, marks object as changed", () => {
    const target = differ({
      a: 1,
      b: "orange",
    });

    target.a = 2;
    assert(hasChanged(target));
  });

  await t.test(
    "if returned to original state, marks object back as unchanged",
    () => {
      const target = differ({
        a: 1,
        b: "orange",
      });

      target.a = 2;
      assert(hasChanged(target));

      target.a = 1;
      assert(!hasChanged(target));
    },
  );

  await t.test(
    "on nested fields, when changed, marks whole object as changed",
    () => {
      const target = differ({
        b: "orange",
        c: {
          a: 1,
        },
      });

      target.c.a = 2;
      assert(hasChanged(target));
    },
  );

  await t.test(
    "on nested fields under arrays, when changed, marks whole object as changed",
    () => {
      const target = differ({
        b: "orange",
        c: [{ a: 1 }, { a: 2 }],
      });

      target.c[0].a = 3;
      assert(hasChanged(target));
    },
  );

  
  await t.test(
    "null fields not breaks the code",
    () => {
      const target = differ({
        field: null,
        b: 2,
      })

      target.b = 1;

      assert(hasChanged(target));
    });
});

test("injectedFields->toJSON()", async (t) => {
  await t.test("injected fields' JSON structure be the same as the original, no matter how the inner injection structure works", () => {
    const origin = {
      a: [1, 2],
      b: 3,
      c: {
        a: [1, 2]
      }
    };
    const target = differ(structuredClone(origin));

    assert.strictEqual(
      Object.getOwnPropertySymbols(origin).find((symbol) =>
        symbol.description === "Differ.Changed", undefined),
        undefined
    );
    assert.ok(
      Object.getOwnPropertySymbols(target).find((symbol) =>
        symbol.description === "Differ.Changed"
      )
    );

    assert.deepEqual(JSON.stringify(origin), JSON.stringify(target));
  });
});
