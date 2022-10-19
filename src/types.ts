export const Initial = Symbol.for("Differ.Initial");
export const Current = Symbol.for("Differ.Current");

export const Changed = Symbol.for("Differ.Changed");
export const IsNew = Symbol.for("Differ.IsNew");

export type Differ<T> = T & {
  readonly [IsNew]: boolean | undefined;
  readonly [Changed]: boolean;

  [Initial]: string;
  [Current]: string;
};

export function isDiffer<T>(target: unknown): target is Differ<T> {
  return (
    typeof target === "object" &&
    target !== null &&
    (<Record<string | symbol, unknown>>target)[Initial] !== undefined &&
    (<Record<string | symbol, unknown>>target)[Current] !== undefined
  );
}
