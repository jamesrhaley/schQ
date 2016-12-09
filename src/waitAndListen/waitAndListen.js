import Rx from 'rx';

function waitAndListen(listenTo, key, times) {
  return Rx.Observable.create(observer => {
    var count = 0;
    
    var subcription = listenTo.listen(key, (data) => {
      count += 1;
      if (count === times) {
        observer.onNext(key+': finished');
        observer.onCompleted()
      }
    });

    return () => subcription.dispose();
  });
}

export default waitAndListen;