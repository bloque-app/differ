import { isDiffer, Current, Initial, IsNew } from "./types.js";
import type { Differ } from "./types.js";
import { differ, injectNew } from "./differ.js";

type SerializedLike<T> = T & {
  "Differ.IsNew"?: boolean;
  "Differ.Initial"?: string;
  "Differ.Current"?: string;
};

export function replacer(
  this: Record<string | number | symbol, unknown>,
  key: string
) {
  return serialize(this[key]);
}

function serialize<T>(value: T): SerializedLike<T> | T {
  if (isDiffer(value)) {
    return {
      ...(<T>value),
      "Differ.IsNew": value[IsNew],
      "Differ.Initial": value[Initial],
      "Differ.Current": value[Current],
    };
  }

  return value;
}

export function reviver(this: Record<string | number, unknown>, key: string) {
  return deserialize(this[key]);
}

function isSerializedLike<T>(target: T): target is SerializedLike<T> {
  return (
    typeof target === "object" &&
    target !== null &&
    (<Record<string | symbol, unknown>>target)["Differ.Initial"] !==
      undefined &&
    (<Record<string | symbol, unknown>>target)["Differ.Current"] !== undefined
  );
}

function deserialize<T>(value: T): Differ<T> | T {
  if (isSerializedLike(value)) {
    const {
      ["Differ.IsNew"]: isNew,
      ["Differ.Initial"]: initial,
      ["Differ.Current"]: current,
      ...target
    } = value;

    const output = differ(<T>target);

    output[Initial] = initial!;
    output[Current] = current!;
    injectNew(output, isNew);

    return output;
  }

  return value;
}
