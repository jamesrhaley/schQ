import Rx from 'rx';
// taken from rxjs api and https://github.com/stylelab-io/event-emitter-rx/blob/master/EventEmitterRx.js
var hasOwnProp = {}.hasOwnProperty;

function createName (name) {
  return '$' + name;
}

function Emitter() {
  this.subjects = {};
}

Emitter.prototype.emit = function (name, data) {
  var fnName = createName(name);

  this.subjects[fnName] || (this.subjects[fnName] = new Rx.Subject());
  this.subjects[fnName].onNext(data);

};

Emitter.prototype.hasObserver = function (name) {
  return this.subjects[name] !== undefined && this.subjects[name].hasObservers();
};

Emitter.prototype.listen = function (name, handler) {
  var fnName = createName(name);

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

Emitter.prototype.disposeAll = function () {
  var subjects = this.subjects;
  for (var prop in subjects) {
    if (hasOwnProp.call(subjects, prop)) {
      subjects[prop].dispose();
    }
  }
  this.subjects = {};
};

export default Emitter;