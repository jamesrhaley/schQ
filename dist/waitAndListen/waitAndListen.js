'use strict';

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
  return Rx.Observable.create(function (observer) {
    var count;
    var emitter = new Emitter();
    var subcription = emitter.listen('data', function (data) {
      observer.onNext('data: ' + data);
      observer.onCompleted();
    });

    return function () {
      return subcription.dispose();
    };
  });
}