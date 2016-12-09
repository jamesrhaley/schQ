import {expect} from 'chai';
import Emitter from './../emitter/emitter';
import waitAndListen from './waitAndListen';

var emitter = new Emitter();

const asynTest = ((val, count, statement) => {
  describe('waitForListen '+ count, () => {
    it(statement, () => {
      expect(val).to.equal('data'+count+': finished');
    });
  });
});

waitAndListen(emitter, 'data1', 4)
  .subscribe(val => {
    let str = 'should return "data1: finished" after awhile';

    asynTest(val, 1, str);

  });

for (let i = 0; i < 4; i++) {
  setTimeout(() => 
    emitter.emit('data1', 'foo'),
    Math.random()*100
  );
}

waitAndListen(emitter, 'data2', 4)
  .subscribe(val => {
    let str = 'should return "data2: finished" after awhile';

    asynTest(val, 2, str);

    run();
  });

for (let i = 0; i < 4; i++) {
  setTimeout(() => 
    emitter.emit('data2', 'foo'),
    Math.random()*1000
  );
}
