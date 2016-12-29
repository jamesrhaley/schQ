import Rx from 'rx';

var hasOwnProp = {}.hasOwnProperty;

// create a unique key for the subject
function createKey(name) {
  return '$' + name;
}

/**
 * Emitter Object of event emitters that use observable to transmit data
 * based off of the example at https://goo.gl/gw1Z3I with a few more 
 * bells and whistles.
 *
 * @example
 * let emitter = new Emitter();
 * 
 * let subcription = emitter.listen('data', function (data) {
 *   console.log('data: ' + data);
 * });
 * 
 * emitter.emit('data', 'foo');
 * // => data: foo
 * 
 * // Destroy the subscription
 * subscription.dispose();
 */
class Emitter{
  /**
   * @param {Number} [lostCount=10] - Number of event to catpture 
   *   if an event if being emitted but not subscribed.  
   */
  constructor(lostCount=10) {
    /**
     * @type {Object}
     */
    this.subjects = {};
    /**
     * @type {String}
     */
    this._lost = '__lost_data__';
    /**
     * @type {Number}
     */
    this._lostCount = lostCount;
  }

  /**
   * Emitter.hasObserver:
   *  Access the hasObserver property to check if subject has an observer.
   *  This comes in handy because subjects by nature are hot and if you 
   *  emit to a subject that does not have the observer you are emiting
   *  too, there is not a subscriber to perform the side effects you wish
   *  for in your program. It is quite possible for race conditions to 
   *  occur and the event you are listening for to happen before rxjs 
   *  registers the observer that will be listening for it.  
   *  
   *
   * @param {String} name - Name of variable
   * @return {Boolean}
   * @example
   * let emitter = new Emitter();
   * 
   * console.log(emitter.hasObservers(data));
   * // => false
   * 
   * var subscription = emitter.listen(
   *   (x) => {
   *     console.log(x);
   *   });
   * 
   * console.log(emitter.hasObservers(data));
   * // => true
   */
  hasObserver(name) {
    const fnName = createKey(name);

    return this.subjects[fnName] !== undefined
      && this.subjects[fnName].hasObservers();
  }

  /**
   * Emitter.listSubjects:
   *  Returns a list of current Subjects. Each will have a preceding $
   *  tag. 
   *
   * @return {Array} - Array of Strings
   * @example
   * let emitter = new Emitter();
   * 
   * let subcription = emitter.listen('data', function (data) {
   *   console.log('data: ' + data);
   * });
   * 
   * console.log(emitter.listSubjects());
   * // => ['$data']
   */
  listSubjects() {
    return Object.keys(this.subjects);
  }

  /**
   * Emitter.emit:
   *  Emits event to a subscribed listener
   *
   * @param {String} name -> Name of variable
   * @param {Any} data -> Any Data to transmit.. this should be limited 
   * @example
   * let emitter = new Emitter();
   * 
   * let subcription = emitter.listen('data', function (data) {
   *   console.log('data: ' + data);
   * });
   * 
   * emitter.emit('data', 'foo');
   * // => data: foo
   */
  emit(name, data) {
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
  }
  /**
   * Emitter.listen:
   *  listens for an event name and handles it via the handle callback
   *  function.  It is the subscribe method of an observable.  If you wish
   *  to handle error and have a complete function use method subject 
   *
   * @param {String} name -> Name of variable
   * @param {Function} handler -> A function to handle events
   * @return {Function} -> A unsubscribe function via varName.dispose()
   * @example
   * let emitter = new Emitter();
   * 
   * let subcription = emitter.listen('data', function (data) {
   *   console.log('data: ' + data);
   * });
   *
   * subcription.dispose()
   */
  listen(name, handler) {
    const fnName = createKey(name);
    const subjects = this.subjects;

    if (!hasOwnProp.call(subjects, fnName)) {

      this.subjects[fnName] = new Rx.Subject();
    } 

    return this.subjects[fnName]
      .subscribe(handler);
  }

  /**
   * Emitter.unsubscribe:
   *  Unsubscribe from a single Subject
   *
   * @param {String} name -> Name of variable
   * @example
   * let emitter = new Emitter();
   * 
   * emitter.listen('data1', (data)=> console.log(data));
   * emitter.listen('data2', (data)=> console.log(data));
   *
   * console.log(emitter.listSubjects());
   * // => ['$data1', '$data2']
   *
   * emitter.unsubscribe('data1');
   *
   * console.log(emitter.listSubjects());
   * // => ['$data2']
   */
  unsubscribe(name) {
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
  }

  /**
   * Emitter.unsubscribeAll:
   *  Unsubscribe from all Subjects
   * @example
   * let emitter = new Emitter();
   * 
   * emitter.listen('data1', (data) => console.log(data));
   * emitter.listen('data2', (data) => console.log(data));
   * emitter.listen('data3', (data) => console.log(data));
   *
   * console.log(emitter.listSubjects());
   * // => ['$data1', '$data2', '$data3']
   *
   * emitter.unsubscribeAll();
   *
   * console.log(emitter.listSubjects());
   * // => []
   */
  unsubscribeAll() {
    const subjects = this.subjects;
    const keys = Object.keys(subjects);

    keys.forEach(key => {
      subjects[key].dispose();
    });

    this.subjects = {};
  }
}

export default Emitter;