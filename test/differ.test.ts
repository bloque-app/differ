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
});
