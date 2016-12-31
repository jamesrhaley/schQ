/**
 * @ignore
 */
export function objectValues(obj) {
  let keys = Object.keys(obj);
  return keys.map(key => obj[key]);
}

/**
 * @ignore
 */
export function isPlainObject(item) {
  return Object.prototype
    .toString.call(item) === '[object Object]';
}

/**
 * @ignore
 */
export function isArray(x) {
  return Array.isArray(x);
}

/**
 * @ignore
 */
export function isFunction(x) {
  return typeof x === 'function';
}