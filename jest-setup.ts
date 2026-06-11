import '@testing-library/jest-dom';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { deserialize, serialize } from 'node:v8';

process.env.REACT_APP_STAC_API = 'https://fake-stac-api.net';

// jsdom (v20, shipped with jest-environment-jsdom@29) does not expose
// `structuredClone`, which Chakra UI v3 calls internally. The jsdom test
// environment replaces Node's globals, so we attach a v8-backed
// implementation if it's missing.
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = <T>(value: T): T => deserialize(serialize(value));
}
