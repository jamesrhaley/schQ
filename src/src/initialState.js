import Rx from 'rx';

const Observable = Rx.Observable;

/**
 * checkTillTrue:
 *  Returns a promise that will resolve when a object in the application
 *  is completely initialized
 *
 * @private
 * @param {Object} refStateObject - an object that has not completely 
 *   initialized
 * @param {Function} stateCheck - returns true when the refStateObject is
 *   is in the required state for the application
 */
export function checkTillTrue(refStateObject, stateCheck){
  return new Promise(function(resolve) {
    let check = setInterval(
      () => {

        if (stateCheck(refStateObject)) {

          clearInterval(check);

          resolve(true);
        }
      },
      1
    );
  });
}

/**
 * cacheGate:
 *  Returns application data when an initial state is verified to be true
 *
 * @private
 * @param {Object} appData - All of the data being passed to the app.
 * @param {Object} refData - a specific key/value to watch
 * @param {Function} stateCheck - returns true when the refData is in the 
 *   required state for the application
 */
export function cacheGate(appData, refData, stateCheck){
  return Observable
    .fromPromise( checkTillTrue(refData, stateCheck) )
    .map(() => appData);
}

/**
 * justPass:
 *  Is used in conjunction with `cacheGate` and replaces its functionality
 *  once an initial state of the appication is reach.  It only passes 
 *  data.
 *
 * @private
 * @param {Object} appData - All of the data being passed to the app.
 */
export function justPass(appData) {
  return Observable.of(appData);
}

/**
 * beforeThenAfter:
 *  Is used in conjunction with `cacheGate` and replaces its functionality
 *  once an initial state of the appication is reach.  It only passes 
 *  data.
 *
 * @see {@link cacheGate}
 * @see {@link justPass}
 *
 * @private
 * @param {Function} func1 - The function that actually does something.
 * @param {Function} func2 - The function that just passes data.
 */
export function beforeThenAfter(func1, func2) {

  return function (appData, refData, stateCheck) {

    if(stateCheck(refData)) {

      func1 = null;
    }

    let f = func1 || func2;
    return f.apply(
      this,
      [appData, refData, stateCheck]
    );
  };
}