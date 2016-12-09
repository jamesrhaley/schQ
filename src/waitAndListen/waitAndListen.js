var Emitter = require('./emitter');

var emitter = new Emitter();

var subcription = emitter.listen('data', function (data) {
    console.log('data: ' + data);
});

emitter.emit('data', 'foo');
// => data: foo

// Destroy the subscription
subcription.dispose();

function waitAndListen(num) {
  return Rx.Observable.create(observer => {
    var count 
    var emitter = new Emitter();
    var subcription = emitter.listen('data', function (data) {
      observer.onNext('data: ' + data);
      observer.onCompleted()
    });

    return () => subcription.dispose();
  });
}