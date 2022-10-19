import { digest } from "./digest.js";
import { Changed, IsNew, Differ, Current, Initial, isDiffer } from "./types.js";

function injectFields<T extends Record<string, unknown>>(
  target: T,
  parent: Differ<T> = <Differ<T>>target
): Differ<T> | Record<string, unknown> {
  const keys = Object.keys(target);

  for (const [key, value] of Object.entries(target)) {
    if (Array.isArray(value)) {
      Object.assign(target, {
        [key]: value.map((object) => injectFields(object, parent)),
      });
    } else if (typeof value === "object" && value !== null) {
      Object.assign(target, {
        [key]: injectFields(<Record<string, unknown>>value, parent),
      });
    }

    Object.defineProperty(target, `_${key}`, {
      value: target[key],
      writable: true,
      enumerable: false,
    });

    Object.defineProperty(target, key, {
      set(v) {
        this[`_${key}`] = v;
        parent[Current] = digest(parent);
      },
      get() {
        return this[`_${key}`];
      },
    });
  }

  if (parent === target) {
    Object.defineProperty(parent, "toJSON", {
      value(this: Differ<T>) {
        if (Array.isArray(this)) {
          return this;
        }

        return keys.reduce((o, k) => {
          o[k] = (<Record<string, unknown>>this)[`_${k}`];
          return o;
        }, <Record<string, unknown>>{});
      },
    });
  }

  return target;
}

export function differ<T>(target: T): Differ<T> {
  if (isDiffer(target)) {
    return target;
  }

  const initial = digest(target);

  const output: Differ<T> = {
    ...structuredClone(target),
    [Initial]: initial,
    [Current]: initial,

    get [IsNew]() {
      return undefined;
    },
    get [Changed]() {
      return this[Initial] !== this[Current];
    },
  };

  return <Differ<T>>injectFields(output);
}

export function differAll<T>(
  target: T[]
): Differ<T>[] & { push(...args: T[]): number } {
  const output = target.map((t) => differ(t));

  const pushFunction = output.push;
  output.push = function (...items: T[]) {
    const itemsToPush = items.map((target) => {
      const output = differ(target);
      injectNew(output, true);

      return output;
    });

    return pushFunction.apply(this, itemsToPush);
  };

  return output;
}

export function injectNew<T> (target: Differ<T>, isNew: boolean | undefined) {
  Object.defineProperty(target, IsNew, {
    get () { return isNew },
    configurable: false,
  });
}

export function hasChanged<T>(target: Differ<T>) {
  return target[Changed];
}

export function isNew<T>(target: Differ<T>) {
  return target[IsNew] ?? false;
}
