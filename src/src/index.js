import Rx from 'rx';
import Emitter from './../emitter/index';
import processIncoming from './processIncoming';

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

/**
 * runInOrder:
 *  creates a pipeline of queued data and subcribe events
 *  and data returned from those subscribed events. Data is 
 *  delayed until event messages say the last actions have
 *  been performed
 *
 * @param {Emitter} emitter -> RxEventEmitter
 * @param {Array} data -> an Array of Arrays
 * @param {String} key -> key to be id to listen on
 */
 // I still believe I should be using Observable.create here.
 // I should revist to test for memory leaks
export function runInOrder(listenOn, data, key) {
  // this should be bound to an emitter for being finished
  const noop = [ [()=>{}] ];

  // extend the data so there is data to pass with the zipped
  // container while waiting for the last event
  const extendedData = data.slice(0).concat(noop);
  //set the next watch and listen
  let next = start(key);

  return Observable.from(extendedData)
    .map((container, index, source) => {
      let curr = next;
      let len = container.length;

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
}

/**
 * SchQ:
 *  SchQ creates an event scheduling pipeline that I
 *  created to handle d3 events
 *
 * @param {Emitter} e (new Emitter)-> the event Emitter. The only
 *   reason input the Emitter yourself is to include a number argument
 *   to the Emitter to track unsubscribed to events by have a number as
 *   the agument to Emitter i.e. new Emitter(10)
 */
export function SchQ(e) {
  e = e !== undefined ? e : new Emitter(0);
  this._emitter = e;
  this._loadSubject = new Rx.ReplaySubject(1);
  this._processData = processIncoming;
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
 * SchQ.emitter:
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
      return runInOrder(this._emitter, processed, key);
    })
    .switch();
};

/**
 * SchQ.setPrepFunction:
 *  The current prep function does not handle complicated cases
 *  It only make sure only function are in the Array of Arrays.
 *  The only requirement is that your end array contains nested arrays
 *  at every step.
 *
 * @param {Function} fn -> set paramaters for the array that will
 *   pass functions and data to the subscribe function
 */
// give access to the emitter to hook an event
// from another API
SchQ.prototype.setPrepFunction = function (fn) {
  this._processData = fn;
};
