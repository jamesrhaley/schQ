import Rx from 'rx';

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
 * eventListener:
 *  encapsulates Emitter into an event listener using Rx.fromEventPattern
 *
 * @private
 * @param {Emitter} emitter -> RxEventEmitter
 * @param {String} key -> key to be id to listen on
 */
export function eventListener(emitter, key) {
  const addListener = (handler) => emitter.listen(key, handler);

  const removeListener = () => emitter.unlisten(key);

  return Observable
    .fromEventPattern( addListener, removeListener );
}

/**
 * queueDump:
 *  turns an array into an Observable to merge streams with eventListener
 *
 * @private
 * @param {Array} arr -> the array that will act like a queue.
 */
export function queueDump( arr ) {
  return Observable.of( arr );
}

/**
 * stageStream:
 *  concats a stream of events with a listener waiting for those event to
 *  complete
 *
 * @private
 * @param {Observable} queueStream -> an array of events
 * @param {Observable} listenerStream -> An event Listener
 */
export function stageStream(queueStream, listenerStream) {
  return queueStream.merge(listenerStream);
}

export function stager(schQstream, emitter, key, getLen) {
  return Observable.create(observer => {
    let started = true;
    let wait = 0;
    let queue;
    let capturedData = [];

    const subscription = schQstream.subscribe({
      onNext: pushedData => {

        if (started) {

          // this is when the stream is coming from the queue
          started = false;

          queue = pushedData;

          let next = queue.shift();

          wait = getLen(next);

          observer.onNext({
            message: { key },
            next,
            emitter
          });
        }

        else {

          wait = wait - 1;

          capturedData.push(pushedData);

          if (queue.length > 0  && wait === 0) {

            let next = queue.shift();

            wait = getLen(next);
            
            observer.onNext({
              message: { key, events: capturedData },
              next,
              emitter
            });
          }
        }
      },

      onError :  observer.onError.bind(observer),
      onComplete :  observer.onCompleted.bind(observer)
    });

    return () => subscription.dispose();
  });
}