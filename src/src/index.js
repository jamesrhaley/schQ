import Rx from 'rx';
import Emitter from './../emitter/index';
import processIncoming from './processIncoming';
import validate from './validate';

const Observable = Rx.Observable;

/**
 * waitAndListen:
 *  takes an rx event emitter and that listens
 *  for a number of times a certain key has reported that
 *  it has finished an action.
 *
 * @param {Emitter} emitter -> RxEventEmitter
 * @param {Number} times -> Number of event to count/wait
 * @param {String} key -> key to be id to listen on
 */
export function waitAndListen(emitter, times, key) {
  return Observable.create(observer => {
    let count = 0;
    let capturedData = [];

    const subscription = emitter.subject(key)
      .subscribe( 
        data => {
          count += 1;
          // capture all returning data for use in next cycle
          capturedData.push(data);

          if (count >= times) {

            observer.onNext({key, events: capturedData });

            observer.onCompleted();
          }
        },
        observer.onError.bind(observer),
        observer.onCompleted.bind(observer)
      );

    return () => {

      emitter.unsubscribe(key);

      subscription.dispose();
    };
  });
}

// initial Observable when time to start is zero
function start(key) {
  return Observable.of({key});
}

// function finish(key) {
//   return Observable.of(key+': ended');
// }

function sourcLen(original) {
  return original.source._iterable.length;
}

const last = [[() => {} ]];

const len = (obj) => obj.length;

/**
 * runInOrder:
 *  creates a pipeline of queued data and subcribe events
 *  and data returned from those subscribed events. Data is 
 *  delayed until event messages say the last actions have
 *  been performed
 *
 * @param {Function} doLast -> what to do when sequence completes
 * @param {Function} getLen -> how to get the length of each Object
 * @return {Function} ->
 *   @param {Emitter} emitter -> RxEventEmitter
 *   @param {Array} data -> an Array of Arrays
 *   @param {String} key -> key to be id to listen on
 */
 // I still believe I should be using Observable.create here.
 // I should revist to test for memory leaks
export function runInOrder(doLast, getLen){
  doLast = typeof doLast !== 'undefined' ? doLast : last;

  getLen = typeof getLen !== 'undefined' ? getLen : len;

  return function (listenOn, data, key) {

    // extend the data so there is data to pass with the zipped
    // container while waiting for the last event
    const extendedData = data.slice(0).concat(doLast);
    //set the next watch and listen
    let next = start(key);

    return Observable.from(extendedData)
      .map((container, index, source) => {
        let curr = next;
        let len = getLen(container);

        if (index + 1 < sourcLen(source)) {
          next = waitAndListen(listenOn, len, key);
        } else {
          // this might be a tiny memory leak
          next = null;
        }

        return Observable.zip(
          curr,
          Observable.of(container),
          (message, data) => ({message, data})
        );
      }).concatAll();
  };
}

const baseSetting = {
  lostData : 0,
  preprocess : processIncoming,
  doLast : last,
  checkout: len
};

/**
 * SchQ:
 *  SchQ is an event scheduling pipeline that I’ve created to schedule d3
 *  animations.  It can also be used for preforming the same operation 
 *  in any other sequence where controlling the order of events needs to be 
 *  automatically canceled when the state of the application has changed.
 *
 * @param {Object} config (baseSetting)-> {
 *   @param {Number} lostData (0) -> Set the number of items of lost data
 *      to track if you need to test or have another use for that lost information
 *   @param {Function} preprocess (processIncoming) -> create a consistent
 *     interable. i.e. processIncoming creates an Array of Arrays of Functions
 *   @param {Function} doLast (last) -> what to do when all process are 
 *     finished. i.e. last is a noop () => {}
 *   @param {Function} checkout (len) -> how schQ know how many items out
 *     preforming operations. i.e. len gets the length of each Array of 
 *     Functions created by processIncoming
 * }
 */
export default function SchQ(config=baseSetting) {
  const allConfig = validate(baseSetting, config);

  let {lostData, preprocess, doLast, checkout} = allConfig;

  this._emitter = new Emitter(lostData);
  this._loadSubject = new Rx.ReplaySubject(1);
  this._processData = preprocess;
  this._runInOrder = runInOrder(doLast, checkout);
}

/**
 * SchQ.emitter:
 *  give access to the emitter to hook an event from another API
 *
 * @return {Emitter}
 */
// give access to the emitter to hook an event
// from another API
SchQ.prototype.emitter = function () {
  return this._emitter;
};

/**
 * SchQ.loader:
 *  pushes data to the pipline and gives the event listener 
 *  a key to listen on.
 *
 * @param {Array} data -> an Array of Arrays that pushes each
 *   nested array to the subscribe of the like a queue.
 * @param {String} key -> This key is used to subscribe to an event
 *   before pushed down the pipeline.  Once you subscribe to the 
 *   pipeline this key will available via {}.message to emit on. 
 */
SchQ.prototype.loader = function (data, key) {
  this._loadSubject.onNext({data, key});
};

/**
 * SchQ.run:
 *  The subscribe of the pipeline
 *
 * @return {Observable}
 */
SchQ.prototype.run = function () {
  return this._loadSubject
    .map(loaded => {
      const {data, key} = loaded;
      const processed = this._processData(data);
      const rio = this._runInOrder;
      return rio(this._emitter, processed, key);
    })
    .switch();
};

