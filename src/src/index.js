import Rx from 'rx';
import Emitter from './../emitter/index';
import processIncoming from './processIncoming';
import validate from './validate';

import { 
  cacheGate,
  justPass,
  beforeThenAfter
} from './initialState';

const Observable = Rx.Observable;

/** recreated hasObservers to mod to v5 */
// if (!Rx.Subject.prototype.hasObservers) {
//   Rx.Subject.prototype.hasObservers = function hasObservers() {
//     if (this.isUnsubscribed) {
//       throw new Rx.ObjectUnsubscribedError();
//     }

//     return this.observers.length > 0;
//   };
// }

/**
 * waitAndListen:
 *  takes an rx event emitter and that listens
 *  for a number of times a certain key has reported that
 *  it has finished an action.
 *
 * @private
 * @param {Emitter} emitter -> RxEventEmitter
 * @param {Number} times -> Number of event to count/wait
 * @param {String} key -> key to be id to listen on
 */
export function waitAndListen(emitter, times, key) {

  return Observable.create(observer => {
    let count = 0;
    let capturedData = [];

    const addListener = (handler) => emitter.listen(key, handler);

    const removeListener = () => emitter.unlisten(key);

    const subscription = Observable
      .fromEventPattern( addListener, removeListener)
      .subscribe({
        onNext :(data) => {
          count += 1;
          // capture all returning data for use in next cycle
          capturedData.push(data);

          if (count >= times) {

            observer.onNext({key, events: capturedData });

            observer.onCompleted();
          }
        },

        onError :  observer.onError.bind(observer),
        onComplete :  observer.onCompleted.bind(observer)
      });

    return () => subscription.dispose();
  });
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
 * @private
 * @param {Function} doLast - what to do when sequence completes
 * @param {Function} getLen - how to get the length of each Object
 * @return {Function} 
 */
 // I still believe I should be using Observable.create here.
 // I should revist to test for memory leaks
export function runInOrder(doLast, getLen){
  doLast = typeof doLast !== 'undefined' ? doLast : last;

  getLen = typeof getLen !== 'undefined' ? getLen : len;
  /**
   * @param {Emitter} emitter - RxEventEmitter
   * @param {Array} data - an Array of Arrays
   * @param {String} key - key to be id to listen on
   * @return {Observable} stream of operations to perform 
   */
  return function (emitter, data, key) {

    // extend the data so there is data to pass with the zipped
    // container while waiting for the last event
    const extendedData = data.slice(0).concat(doLast);
    //set the next watch and listen
    let next = Observable.of({key});

    return Observable.from(extendedData)
      .map((container, index) => {
        let currentMessage = next;
        let len = getLen(container);
        //let bool = undefined;

        if (index + 1 < extendedData.length) {

          next = waitAndListen(emitter, len, key);

        } else {
          // this might be a tiny memory leak
          next = null;

        }

        const currentStream = Observable
          .zip(
            currentMessage,
            Observable.of(container),
            (message, next) => ({message, next})
          );

        const withEmitterStream = Observable
          .combineLatest(
            Observable.of(emitter),
            currentStream,
            (emitter, current) => Object.assign({}, {emitter}, current)
          );

        return withEmitterStream;
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
 * SchQ is an event scheduling pipeline that I’ve created to schedule d3
 * animations.  It can also be used for preforming the same operation in
 * any other sequence where controlling the order of events needs to be
 * automatically canceled when the state of the application has changed.
 *
 * @access public
 * @example
 * // initialize SchQ
 * let schQ = new SchQ();
 *
 * // load data and a key
 * schQ.loader([[func,func],[func]], 'data');
 *
 * // run
 * let subscriber = schQ.run();
 *
 * // subcribe
 * subscriber.subscribe(packet => {
 *   let {message, next, emitter} = packet;
 *   let {key} = message;
 *   data.forEach(item => {
 *      item(emitter.emit({key}));
 *   });
 * });
 */
class SchQ{
  /**
   * @access public
   * @param {Object} [config=baseSetting] - Object of arguments
   * @param {Function} [config.checkout=len] - how schQ know how many 
   *   items out preforming operations. i.e. default gets the length of 
   *   each Array of Functions created by processIncoming
   * @param {Function} [config.doLast=last] - what is performed when all 
   *   process are finished. i.e. default is () => {}
   * @param {Number} [config.lostData=0] - Set the number of lost data
   *   items to track for tests or have another use cases
   * @param {Function} [config.preprocess=processIncoming] - create a 
   *   interable. i.e. default is an Array of Arrays of Functions
   */
  constructor(config=baseSetting) {
    // update any basesetting a user wants changed
    const allConfig = validate(baseSetting, config);

    let {lostData, preprocess, doLast, checkout} = allConfig;
    /**
     * @type {Emitter}
     */
    this._emitter = new Emitter(lostData);
    /**
     * @type {Subject}
     */
    this._loadSubject = new Rx.ReplaySubject(1);
    /**
     * @type {Function}
     */
    this._processData = preprocess;
    /**
     * @type {Function}
     */
    this._runInOrder = runInOrder(doLast, checkout);
  }


  /**
   * SchQ.emitter:
   *  give access to the emitter to hook an event from another API
   *
   * @return {Emitter}
   */
  emitter() {
    return this._emitter;
  }

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
  loader(next, key) {
    this._loadSubject.onNext({next, key});
  }

  /**
   * SchQ.run:
   *  The subscribe of the pipeline
   *
   * @return {Observable}
   */
  run() {
    return this._loadSubject
      .map(loaded => {
        const {next, key} = loaded;
        const processed = this._processData(next);
        const stateOfEmitter = beforeThenAfter(cacheGate, justPass);

        return this._runInOrder(this._emitter, processed, key)
        .map((data)=>
          stateOfEmitter(
            data,
            data.emitter,
            (e) => e.hasObserver(key))
          ).concatAll();
      })
      .switch();

  }
}

export default SchQ;
