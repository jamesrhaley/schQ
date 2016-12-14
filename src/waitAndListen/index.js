import Rx from 'rx';

const Observable = Rx.Observable;

// waitAndListen takes an rx event emitter and that listens
// for a number of times a certain key has reported that
// it has finished an action.
// listenOn -> RxEventEmitter
// key -> string
// time -> number of times a key needs to be listened for 
function waitAndListen(listenOn, key, times) {
  return Observable.create(observer => {
    var count = 0;
    
    const subscription = listenOn.listen(key, () => {
      
      count += 1;

      if (count === times) {

        observer.onNext(key+': finished');

        observer.onCompleted();
      }
    });

    return () => {

      listenOn.dispose(key);

      subscription.dispose();
    };
  });
}

function start(key) {
  return Observable.of(key+': started');
}

function finish(key) {
  return Observable.of(key+': ended');
}

//data should be an array might consider making this
// a create because it might be reasonable to keeps some
// or it might not.  we will see tomorrow.
export function runInOrder(listenOn, data, key){
  let next = start(key);

  const extendedData = data.slice(0).concat([-1]);

  return Observable.from(extendedData)
    .map(val => {
      let curr = next;
      if (val >= 0) {
        next = waitAndListen(listenOn, key, val);
      } else {
        next = finish(key);
      }

      return Observable.zip(
        curr,
        Observable.of(val)
      );
    }).concatAll();
}


export default waitAndListen;