import Emitter from './index';
import {expect} from 'chai';

const emitter = new Emitter();

describe('emitter', () => {
  let value, firstEmitter, removed$Data, threeEmitters,
    oneEmitterGone, allEmittersRemoved;

  
  before(function(done){
    
    // set one subject listener
    emitter.listen('data', function (data) {
      value = 'data: ' + data;
    });

    // emit to that the first listener
    emitter.emit('data', 'foo');

    // get the name of the first listener
    firstEmitter = emitter.listObservers();

    // dispose all listener
    emitter.disposeAll();

    // verify all listeners are removed
    removed$Data = emitter.listObservers();

    // add three listeners
    for (let i = 0; i < 3; i++){
      let str = 'data' + (i + 1);
      emitter.listen(str, function (data) {
        value = str + ': ' + data;
      });      
    }

    // get the keys of all three
    threeEmitters = emitter.listObservers();

    // remove one emitter
    emitter.dispose('data1');

    oneEmitterGone = emitter.listObservers();

    // remove remaining emitters
    emitter.disposeAll();

    allEmittersRemoved = emitter.listObservers();
    
    done();
  });

  it('Emitter emitts value to listener', () => {
    expect(value).to.equal('data: foo');
  });

  it('Before dispoes emitter has a key', () => {
    expect(firstEmitter).to.eql(['$data']);
  });

  it('After dispoes emitter lacks a key', () => {
    expect(removed$Data).to.eql([]);
  });

  it('There are now three keys', () => {
    expect(threeEmitters)
      .to.eql(['$data1', '$data2', '$data3']);
  });

  it('After removing one emitter two remain', () => {
    expect(oneEmitterGone)
      .to.eql(['$data2', '$data3']);
  });

  it('no emitters should remain', () => {
    expect(allEmittersRemoved).to.eql([]);
  });
});
