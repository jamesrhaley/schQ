// import Emitter from './../emitter/index';
// import { cacheGate } from './initialState';


// const emitter = new Emitter();


// const addListener = (handler) => emitter.listen('outer', handler);

// const removeListener = (handler) => emitter.unlisten('outer', handler);

// const outerStream = Rx.Observable
//   .fromEventPattern(
//     addListener,
//     removeListener,
//     (data)=> {console.log('inside: ' + data); return data;}
//   ).startWith(true);




// const masterkey = 'outer';
// let stateObject = {emitter, masterkey};
// let i = 0
// outerStream
//   .do(x=>console.log('what is the value',x))
//   .map(() => stateObject)
//   .map((data)=>
//        cacheGate(
//         data,
//         data.emitter,
//         (val) =>val.hasObserver(data.masterkey))).concatAll()
//   .startWith({})

//   .subscribe(x=>{
//     if (Object.keys(x).length > 0 && i < 3) {
//       let {emitter, masterkey} = x
//       console.log('did val get here', emitter.hasObserver(masterkey))
//       emitter.emit(masterkey, 'fuck yeah')
//       i++;
//     }
//   });
