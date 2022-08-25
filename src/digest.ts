import digestSync from 'crypto-digest-sync';

function _serialize(object: Array<any> | Record<string, unknown> | unknown): string {
  if (Array.isArray(object)) {
    return `[${object.map((el) => _serialize(el)).join(",")}]`;
  } else if (typeof object === "object" && object !== null) {
    let acc = "";
    const keys = Object.keys(object).sort();

    acc += `{${JSON.stringify(keys)}`;

    for (const key of keys) {
      acc += `${_serialize((object as Record<string, unknown>)[key])},`;
    }

    return `${acc}}`;
  }

  return `${JSON.stringify(object)}`;
}

export function serialize<T>(object: T) {
  return _serialize(object);
}

export function digest<T>(
  object: T,
  hashAlgorithm: "SHA-256" = "SHA-256",
) {
  const message = new TextEncoder().encode(serialize(object));
  const digest = digestSync(hashAlgorithm, message);

  if (globalThis.Buffer) {
    return Buffer.from(digest).toString("base64");
  }

  return btoa(
    String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))),
  );
}
