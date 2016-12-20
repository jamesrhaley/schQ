// /*eslint no-console: "off"*/
// import Rx from 'rx';

// let loadSubject = new Rx.Subject();

// let innerSubject = new Rx.Subject();

// Rx.Observable.interval(1000)
//   .map(i => innerSubject.onNext(i))
//   .subscribe();


// let loadStream = loadSubject
//   .map(data => 
//     innerSubject
//       .map((i)=> data+i))
//   .switch();
  
// let closeStream = loadStream
//   .subscribe(data => console.log(data));




// loadSubject.onNext('a');

// setTimeout(() => loadSubject.onNext('b'), 2000);

// //setTimeout(() => loadSubject.onCompleted(), 3000);

// setTimeout(() => loadSubject.onNext('c'), 5000);

// setTimeout(() => closeStream.dispose(), 14000);


// //setTimeout(() => loadSubject.onCompleted(), 9000);

// setTimeout(() => loadSubject.onNext('d'),11000);

// setTimeout(() => loadSubject
//    .subscribe(data => console.log('will this happen', data)
// ),9000);