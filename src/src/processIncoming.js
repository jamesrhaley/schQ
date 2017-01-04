import { isPlainObject, isFunction, isArray } from './utils';

// verify makes sure nested items are Functions
// this process needs a hook to add custom verification.
const verify = (item, str) => {
  if (!isFunction(item)) {
    throw new Error(str +' in load must only contain Functions');
  }
};

// takes an array and tranforms it into a queue like array
// be subcribed to from the scheduling Observable.
/**
 * @private
 */
export default function processIncoming(arr) {
  var result = [];

  arr.forEach(item => {
    if (isArray(item)) {

      item.forEach(each => {
        verify(each, 'Nested Arrays');
      });

      result.push(item);
    }

    else if (isFunction(item)) {

      result.push([item]);
    }

    else if (isPlainObject(item)) {

      Object.keys(item).forEach(key => {

        verify(item[key], 'Objects');

        result.push( [item[key]] );
      });
    }
    else {
      throw new Error('Load only takes an Array of Objects, Arrays, or Functions');
    }
  });

  return result;
}