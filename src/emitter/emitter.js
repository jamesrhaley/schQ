var Rx = require('rx');

var hasOwnProp = {}.hasOwnProperty;

function createName (name) {
  return '$' + name;
}

function Emitter() {
  this.subjects = {};
}

Emitter.prototype.emit = function (name, data) {
  var fnName = createName(name);
  console.log('emit',fnName);

  this.subjects[fnName] || (this.subjects[fnName] = new Rx.Subject());
  this.subjects[fnName].onNext(data);

  console.log('subjects',this.subjects);
};

Emitter.prototype.listen = function (name, handler) {
  var fnName = createName(name);
  console.log('listen',fnName);
  this.subjects[fnName] || (this.subjects[fnName] = new Rx.Subject());
  return this.subjects[fnName].subscribe(handler);
};

Emitter.prototype.dispose = function () {
  var subjects = this.subjects;
  for (var prop in subjects) {
    if (hasOwnProp.call(subjects, prop)) {
      subjects[prop].dispose();
    }
  }

  this.subjects = {};
};

module.exports = Emitter;