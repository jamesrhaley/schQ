## schQ
  
[![Travis](https://img.shields.io/travis/jamesrhaley/schQ.svg)]()
[![Codecov](https://img.shields.io/codecov/c/github/jamesrhaley/schQ.svg)]()

a schedule that uses rx I am building

run to develop

```
$ git clone https://github.com/jamesrhaley/schQ.git
$ cd project
$ npm install
$ npm run validate
```

# SchQ:
  SchQ is an event scheduling pipeline that I’ve created to schedule d3
  animations.  It can also be used for preforming the same operation 
  in any other sequence where controlling the order of events needs to be 
  automatically canceled when the state of the application has changed.

 @param {Object} config (baseSetting)-> {
   @param {Number} lostData (0) -> Set the number of items of lost data to track if you need to test or have another use for that lost information
   @param {Function} preprocess (processIncoming) -> create a consistent interable. i.e. processIncoming creates an Array of Arrays of Functions
   @param {Function} doLast (last) -> what to do when all process are finished. i.e. last is a noop () => {}
   @param {Function} checkout (len) -> how schQ know how many items out preforming operations. i.e. len gets the length of each Array of Functions created by processIncoming
 }

SchQ.emitter:
  give access to the emitter to hook an event from another API

 @return {Emitter}

SchQ. loader:
  pushes data to the pipline and gives the event listener a key to listen on.

 @param {Array} data -> an Array of Arrays that pushes each nested array to the subscribe of the like a queue.
 @param {String} key -> This key is used to subscribe to an event before pushed down the pipeline.  Once you subscribe to the pipeline this key will available via {}.message to emit on. 

SchQ.run:
  The subscribe of the pipeline

 @return {Observable}

# Emitter:
Object of event emitters that use observable to transmit data
@param {Number} lostCount (10) -> Number of event to catpture if an event if being emitted but not subscribed.

Emitter.hasObserver:
  Access the hasObserver property to check if subject is observing and not just initialized

 @param {String} name -> Name of variable

Emitter.listSubjects:
  Returns a list of current Subjects in Emitter for testing  @return {Array} -> Array of Strings

 Emitter.emit:
  Emits event to a subscribed listener

 @param {String} name -> Name of variable
 @param {Any} data -> Any Data to transmit.. this should be limited 

Emitter.listen:
  Listen captures and handles events

 @param {String} name -> Name of variable
 @param {Function} handler -> A function to handle events
 @return {Function} -> A function that disposes the observable via varName.dispose()

 Emitter.subject:
  Listen captures and handles events the same as Emitter.listen with the point of having the access to the full Subject to be able to write an Observable.create for onComplete and onError

 @param {String} name -> Name of variable
 @return {Subject} -> a Subject for the Observable subscribe

 Emitter.unsubscribe:
  Unsubscribe from a single Subject

 @param {String} name -> Name of variable

Emitter.unsubscribeAll:
  Unsubscribe from all Subjects

