import Rx from 'rx';
import processIncoming from './processIncoming';

const Observable = Rx.Observable;

// waitAndListen takes an rx event emitter and that listens
// for a number of times a certain key has reported that
// it has finished an action.
// listenOn -> RxEventEmitter
// key -> string
// time -> number of times a key needs to be listened for 
export function waitAndListen(listenOn, times, key) {
  return Observable.create(observer => {
    var count = 0;
    let capturedData = [];

    const subscription = listenOn.listen(key, (data) => {
      
      count += 1;
      // capture all returning data for use in next cycle
      capturedData.push(data);

      if (count === times) {

        observer.onNext({key, data: capturedData });

        observer.onCompleted();
      }
    });

    return () => {

      listenOn.dispose(key);

      subscription.dispose();
    };
  });
}

// initial Observable when time to start is zero
function start(key) {
  return Observable.of(key+': started');
}

// function finish(key) {
//   return Observable.of(key+': ended');
// }

function sourcLen(original) {
  return original.source._iterable.length;
}

// function zipAndListen(container, index, source) {
//   let next = start(key);
//   let noop = [ [()=>{}] ];

//   return Observable.create(observer => {
//     let curr = next;
//     let len = container.length;

//     if (index + 1 < sourcLen(source)) {

//       next = waitAndListen(listenOn, len, key);

//     } else {
//       next = null;
//     }

//     const subscription = Observable.zip(
//         curr,
//         Observable.of(container)
//       );

//     observer.onNext(subscription);

//     if (index + 1 === sourcLen(source)) {
//       observer.onCompleted();
//     }

//     return () => {

//       if (next != null) {
//         next.dispose();
//       }

//       subscription.dispose();
//     };

//   }); 
// }
//data should be an array might consider making this
// a create because it might be reasonable to keeps some
// or it might not.  we will see tomorrow.
export function runInOrder(listenOn, data, key) {
  let next = start(key);
  // this should be bound to an emitter for being finished
  let noop = [ [()=>{}] ];
  let processed = processIncoming(data);

  // extend the data so there is data to pass with the zipped
  // container while waiting for the last event
  const extendedData = processed.slice(0).concat(noop);

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
        Observable.of(container)
      );
    }).concatAll();
}




export function SchQ(e){
  this._emitter = e;
  this._loadSubject = new Rx.ReplaySubject(1);
}

// give acces to Emitter.emit
SchQ.prototype.emit = function (data, key) {
  this._emitter.emit(data, key);
};

// give access to Emitter.listen
SchQ.prototype.listen = function (name, handler) {
  this._emitter.listen(name, handler)
};

// pushes data to the pipline and gives the
// event listener a key to listen on.
SchQ.prototype.loader = function (data, key) {
  this._loadSubject.onNext({data, key});
};

SchQ.prototype.run = function () {
  return this._loadSubject
    .map(loaded => {
      let {data, key} = loaded;
      return runInOrder(this._emitter, data, key)
    })
    .switch();
};


