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
 * When using schQ, you will write a preprocess function. If you are
 * completely satified with your sequence and do not wish to create 
 * further consistency just return your sequence.
 *
 * @param {Array} arr
 * @return {Array} 
 * @example
 * const schq = new SchQ({
 *   preprocess: (arr) => ...do something
 * });
 */
export default function preprocess(arr) {
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