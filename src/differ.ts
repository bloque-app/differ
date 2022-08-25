import { digest } from "./digest.js";

const Changed = Symbol.for("Differ.Changed");
const IsNew = Symbol.for("Differ.IsNew");

type ChangedFunc = () => boolean;

type Differ = Record<string, unknown> & {
  [IsNew]?: boolean;
  [Changed]: boolean;
};

const digestMap: Map<string, { initial: string; current: string }> = new Map();

function injectFields<T>(objectId: string, target: T, parentTarget?: T) {
  const keys = Object.keys(target);

  for (const [key, value] of Object.entries(target)) {
    if (typeof value === "object") {
      Object.assign(target, {
        [key]: injectFields(objectId, value, parentTarget ?? target),
      });
    } else if (value instanceof Array) {
      Object.assign(target, {
        [key]: value.map((t) =>
          injectFields(objectId, t, parentTarget ?? target)
        ),
      });
    }

    Object.defineProperty(target, `_${key}`, {
      value,
      writable: true,
      enumerable: false,
    });

    Object.defineProperty(target, key, {
      set(v) {
        this[`_${key}`] = v;
        digestMap.get(objectId)!.current = digest(parentTarget ?? target);
      },
      get() {
        return this[`_${key}`];
      },
    });
  }

  Object.assign(target, {
    toJSON() {
      return keys.reduce((o, k) => {
        o[k] = (<Record<string, unknown>>target)[`_${k}`];
        return o;
      }, <Record<string, unknown>>{});
    },
  });

  return target;
}

export function differ<T>(target: T): T {
  const objectId = digest(target);
  digestMap.set(objectId, {
    initial: objectId,
    current: objectId,
  });

  target = injectFields(objectId, target);

  digestMap.set(objectId, {
    initial: digest(target),
    current: digest(target),
  });

  Object.defineProperty(target, Changed, {
    get: () =>
      digestMap.get(objectId)!.initial !== digestMap.get(objectId)!.current,
  });

  return target;
}

export function differAll<T>(target: T[]): T[] {
  const outTarget = target.map((t) => differ(t));

  const pushFunction = outTarget.push;
  outTarget.push = function (...items: T[]) {
    const itemsToPush = items.map((item) => {
      item = differ(item);

      Object.defineProperty(item, IsNew, {
        value: true,
        configurable: false,
        writable: false,
      });

      return item;
    });

    return pushFunction.apply(this, itemsToPush);
  };

  return outTarget;
}

export function hasChanged<T>(target: T) {
  return (<Differ>target)[Changed];
}

export function isNew<T>(target: T) {
  return (<Differ>target)[IsNew] ?? false;
}
