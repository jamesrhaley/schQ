import {expect} from 'chai';
import Emitter from './../emitter/emitter';
import waitAndListen from './waitAndListen';

var emitter = new Emitter();

// var subcription = emitter.listen('data', function (data) {
//     console.log('data: ' + data);
// });

waitAndListen(emitter, 'data1', 4)
  .subscribe(x=>console.log(x))




for (var i = 0; i < 4; i++) {
  setTimeout(()=> 
    emitter.emit('data1', 'foo'),
    Math.random()*10000)
}
// Destroy the subscription
// subcription.dispose();
waitAndListen(emitter, 'data2', 4)
  .subscribe(x=>console.log(x))

  for (var i = 0; i < 4; i++) {
  setTimeout(()=> 
    emitter.emit('data2', 'foo'),
    Math.random()*10000)
}