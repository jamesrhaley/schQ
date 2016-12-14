import Rx from 'rx';
// mostly taken from https://github.com/stylelab-io/event-emitter-rx/blob/master/EventEmitterRx.js
const hasOwnProp = {}.hasOwnProperty;
const str = 'Must asign a listener before you can emit.';

function createName(name) {
  return '$' + name;
}

function Emitter() {
  this.subjects = {};
}

Emitter.prototype.hasObserver = function (name) {
  return this.subjects[name] !== undefined 
    && this.subjects[name].hasObservers();
};

Emitter.prototype.listObservers = function () {
  return Object.keys(this.subjects);
};

Emitter.prototype.emit = function (name, data) {
  const fnName = createName(name);

  if (!this.hasObserver(fnName)) {
    throw new Error(str);
  }

  this.subjects[fnName].onNext(data);

};

Emitter.prototype.listen = function (name, handler) {
  const fnName = createName(name);

  if (!this.hasObserver(fnName)) {
    this.subjects[fnName] = new Rx.Subject();
  }

  return this.subjects[fnName].subscribe(handler);
};

Emitter.prototype.dispose = function (name) {
  const fnName = createName(name);
  const subjects = this.subjects;
  const allKeys = Object.keys(subjects);
  const remainingKeys = allKeys.filter(key => key !== fnName);
  const remainingSubjects = {};

  subjects[fnName].dispose();

  remainingKeys.forEach(key => {
    remainingSubjects[key] = subjects[key];
  });

  this.subjects = remainingSubjects;
};

Emitter.prototype.disposeAll = function () {
  const subjects = this.subjects;

  for (let prop in subjects) {

    if (hasOwnProp.call(subjects, prop)) {
      subjects[prop].dispose();
    }
  }

  this.subjects = {};
};


export default Emitter;