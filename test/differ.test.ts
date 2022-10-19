import { differ, hasChanged, Serialization } from "../src/index.js";

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
    }
  );

  await t.test(
    "if built upon an existing differ, will return the original differ",
    () => {
      const origin = differ({
        a: 1,
        b: "orange",
      });
      const target = differ(origin);

      assert.equal(origin, target);
    }
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
    }
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
    }
  );

  await t.test("null or undefined fields should not break the code", () => {
    const target = differ({
      a: null,
      b: 2,
      c: undefined,
    });

    target.b = 1;

    assert(hasChanged(target));
  });
});

test("injectedFields->toJSON()", async (t) => {
  await t.test(
    "injected fields' JSON structure be the same as the original, no matter how the inner injection structure works",
    () => {
      const origin = {
        a: [1, 2],
        b: 3,
        c: {
          a: [1, 2],
        },
      };
      const target = differ(origin);

      assert.strictEqual(
        Object.getOwnPropertySymbols(origin).find(
          (symbol) => symbol.description === "Differ.Changed",
          undefined
        ),
        undefined
      );
      assert.ok(
        Object.getOwnPropertySymbols(target).find(
          (symbol) => symbol.description === "Differ.Changed"
        )
      );

      assert.deepEqual(JSON.stringify(origin), JSON.stringify(target));
    }
  );
});

test("serialize/deserialize", async (t) => {
  await t.test(
    "it is possible to rebuild the differ status { initial, current, isNew } of an object after being reserialized",
    () => {
      const origin = {
        a: [1, 2],
        b: 3,
        c: {
          a: [1, 2],
        },
      };
      const target = differ(origin);
      target.b = 4;

      const serialized = JSON.stringify(target, Serialization.replacer);
      const reconstructed = JSON.parse(serialized, Serialization.reviver);

      assert(hasChanged(reconstructed));

      origin.b = 3;
      assert(hasChanged(reconstructed));

      reconstructed.b = 3;
      assert(!hasChanged(reconstructed));
    }
  );

  await t.test(
    "it is possible to rebuild the differ status of a differ even if it's not root",
    () => {
      const origin = {
        a: [1, 2],
        b: 3,
        c: {
          a: [1, 2],
        },
      };
      const target = differ(origin);
      target.b = 4;

      const serialized = JSON.stringify({ target }, Serialization.replacer);
      const { target: reconstructed } = JSON.parse(
        serialized,
        Serialization.reviver
      );

      assert(hasChanged(reconstructed));
    }
  );
});
