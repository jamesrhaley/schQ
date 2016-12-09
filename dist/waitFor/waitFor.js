'use strict';

var Rx = require('rx');
var objToArray = require('./../util');

function waitFor(num) {
  return Rx.Observable.create(function (observer) {
    var watchers = {};
    var count = 0;

    for (var i = 0; i < num; i++) {
      var key = '$' + (i + 1);

      watchers[key] = Rx.Observable.of(true).delay(Math.random() * 1000);
    }

    var all = Rx.Observable.concat(objToArray(watchers)).subscribe(function () {

      count++;

      if (count === num) {
        observer.onNext(true);
        observer.onCompleted();
      }
    });

    return function () {
      return all.dispose();
    };
  });
}

module.exports = waitFor;