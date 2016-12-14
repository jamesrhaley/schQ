import Rx from 'rx';
// partially taken from https://github.com/stylelab-io/event-emitter-rx/blob/master/EventEmitterRx.js

const emitError = 'Must asign a listener before you can emit.';
const listenError = 'Keys can not have multiple handlers';

function createName(name) {
  return '$' + name;
}

// as of right now Subjects are hot
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
    
    throw new Error(emitError);
  }

  this.subjects[fnName].onNext(data);
};

Emitter.prototype.listen = function (name, handler) {
  const fnName = createName(name);

  if (!this.hasObserver(fnName)) {

    this.subjects[fnName] = new Rx.Subject();
  } else {

    throw new Error(listenError);
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
  const keys = Object.keys(subjects);

  keys.forEach(key => {
    subjects[key].dispose();
  });

  this.subjects = {};
};


export default Emitter;