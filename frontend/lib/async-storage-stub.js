/**
 * Web stub for @react-native-async-storage/async-storage.
 * MetaMask SDK optionally requires it; we don't use it in the browser.
 */
const noop = () => Promise.resolve(undefined);
const noopStr = () => Promise.resolve(null);

export default {
  getItem: noopStr,
  setItem: noop,
  removeItem: noop,
  mergeItem: noop,
  clear: noop,
  getAllKeys: () => Promise.resolve([]),
  multiGet: () => Promise.resolve([]),
  multiSet: noop,
  multiRemove: noop,
  multiMerge: noop,
};
