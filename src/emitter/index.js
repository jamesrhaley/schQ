import Rx from 'rx';

var hasOwnProp = {}.hasOwnProperty;

// create a unique key for the subject
function createKey(name) {
  return '$' + name;
}

/**
 * Emitter:
 *  Object of event emitters that use observable to transmit data
 *
 * @param {Number} lostCount (10) -> Number of event to catpture 
 *   if an event if being emitted but not subscribed.
 */
function Emitter(lostCount = 10) {
  this.subjects = {};
  this._lost = '__lost_data__';
  this._lostCount = lostCount;
}

/**
 * Emitter.hasObserver:
 *  Access the hasObserver property to check if subject is
 *  observing and not just initialized
 *
 * @param {String} name -> Name of variable
 */
Emitter.prototype.hasObserver = function (name) {
  const fnName = createKey(name);

  return this.subjects[fnName] !== undefined
    && this.subjects[fnName].hasObservers();
};

/**
 * Emitter.listSubjects:
 *  Returns a list of current Subjects in Emitter for testing 
 *
 * @return {Array} -> Array of Strings
 */
Emitter.prototype.listSubjects = function () {
  return Object.keys(this.subjects);
};

/**
 * Emitter.emit:
 *  Emits event to a subscribed listener
 *
 * @param {String} name -> Name of variable
 * @param {Any} data -> Any Data to transmit.. this should be limited 
 */
Emitter.prototype.emit = function (name, data) {
  const fnName = createKey(name);
  const subjects = this.subjects;

  // check to see if the subject object is missing a key and 
  // if the user wishes for any unlisten to data to be caught
  if (!hasOwnProp.call(subjects, fnName)) {
    let l = createKey(this._lost);

    if (this._lostCount > 0) {
      
      if(!hasOwnProp.call(subjects, l)) {
        subjects[l] = new Rx.ReplaySubject(this._lostCount);
      }

      subjects[l].onNext(data);
    }

  } else {
    subjects[fnName].onNext(data);
  }
};

/**
 * Emitter.listen:
 *  Listen captures and handles events
 *
 * @param {String} name -> Name of variable
 * @param {Function} handler -> A function to handle events
 * @return {Function} -> A function that disposes the observable via varName.dispose()
 */
Emitter.prototype.listen = function (name, handler) {
  const fnName = createKey(name);
  const subjects = this.subjects;

  if (!hasOwnProp.call(subjects, fnName)) {

    this.subjects[fnName] = new Rx.Subject();
  } 

  return this.subjects[fnName]
    .subscribe(emittedData => {
      handler(emittedData);
    });
};

/**
 * Emitter.subject:
 *  Listen captures and handles events the same as Emitter.listen
 *  with the point of having the access to the full Subject to be
 *  able to write an Observable.create for onComplete and onError
 *
 * @param {String} name -> Name of variable
 * @return {Subject} -> a Subject for the Observable subscribe
 */
Emitter.prototype.subject = function (name) {
  const fnName = createKey(name);
  const subjects = this.subjects;

  if (!hasOwnProp.call(subjects, fnName)) {

    this.subjects[fnName] = new Rx.Subject();
  } 

  return this.subjects[fnName];
};

/**
 * Emitter.unsubscribe:
 *  Unsubscribe from a single Subject
 *
 * @param {String} name -> Name of variable
 */
Emitter.prototype.unsubscribe = function (name) {
  const fnName = createKey(name);
  const subjects = this.subjects;
  const remainingSubjects = {};
  
  subjects[fnName].dispose();

  Object.keys(subjects)
    .filter(key => 
      key !== fnName
    )
    .forEach(key => {
      remainingSubjects[key] = subjects[key];
    });

  this.subjects = remainingSubjects;
};

/**
 * Emitter.unsubscribeAll:
 *  Unsubscribe from all Subjects
 */
Emitter.prototype.unsubscribeAll = function () {
  const subjects = this.subjects;
  const keys = Object.keys(subjects);

  keys.forEach(key => {
    subjects[key].dispose();
  });

  this.subjects = {};
};


export default Emitter;