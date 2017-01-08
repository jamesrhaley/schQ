/**
 * for esdoc
 * @ignore
 */
export function objectValues(obj) {
  let keys = Object.keys(obj);
  return keys.map(key => obj[key]);
}

/**
 * for esdoc
 * @ignore
 */
export function isPlainObject(item) {
  return Object.prototype
    .toString.call(item) === '[object Object]';
}

/**
 * for esdoc
 * @ignore
 */
export function isArray(x) {
  return Array.isArray(x);
}

/**
 * for esdoc
 * @ignore
 */
export function isFunction(x) {
  return typeof x === 'function';
}

/**
 * for esdoc
 * @ignore
 */
export function isPromise(x) {
  return x.toString() === '[object Promise]';
}