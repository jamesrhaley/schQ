import Emitter from './index';
import {expect} from 'chai';

const emitter = new Emitter();

describe('emitter', () => {
  let firstEmitedValue,
    subscription,
    hasObserve,
    firstEmitter,
    unsubscribedEmitter,
    threeEmitters,
    oneEmitterGone,
    allEmittersRemoved,
    thereIsLostData,
    caughtLostData = [];

  
  before(function (done){
    // set one subject listener
    emitter.listen('data', function (data) {
      firstEmitedValue = 'data: ' + data;
    });

    // emit to that the first listener
    emitter.emit('data', 'foo');

    hasObserve = emitter.hasObserver('data');
    
    // add another subscription to the same event
    subscription = emitter.listen('data', function (data) {
      return 'data: ' + data;
    });

    // get the name of the first listener
    firstEmitter = emitter.listSubjects();

    // dispose all listener
    emitter.unsubscribe('data');

    // verify all listeners are removed
    unsubscribedEmitter = emitter.listSubjects();

    // add three listeners
    for (let i = 0; i < 3; i++){
      let str = 'data' + (i + 1);
      emitter.listen(str, function (data) {
        return str + ': ' + data;
      });      
    }

    // get the keys of all three
    threeEmitters = emitter.listSubjects();

    // remove one emitter
    emitter.unsubscribe('data1');

    oneEmitterGone = emitter.listSubjects();

    // remove remaining emitters
    emitter.unsubscribeAll();

    allEmittersRemoved = emitter.listSubjects();

    emitter.emit('data5','foo');

    emitter.emit('data6','foo');

    thereIsLostData = emitter.listSubjects();

    emitter.listen('__lost_data__', function (data) {
      caughtLostData.push(data);
    });

    done();
  });
  

  it('Emitter emitts value to listener', () => {
    expect(firstEmitedValue).to.equal('data: foo');
  });

  it('Events can be listen on by multiple subscibers', () => {
    expect(subscription).to.exist;
  });

  it('Can access method hasObserver', () => {
    expect(hasObserve).to.be.true;
  });

  it('Before unsubscribe emitter has a the key `$data`', () => {
    expect(firstEmitter).to.eql(['$data']);
  });

  it('After unsubscribe emitter lacks any key', () => {
    expect(unsubscribedEmitter).to.eql([]);
  });

  it('There are now three keys of three emitters', () => {
    expect(threeEmitters)
      .to.eql(['$data1', '$data2', '$data3']);
  });

  it('After removing one emitter two remain', () => {
    expect(oneEmitterGone)
      .to.eql(['$data2', '$data3']);
  });

  it('No emitters should remain', () => {
    expect(allEmittersRemoved).to.eql([]);
  });

  it('Data that is emitted by not listen to is caught', () => {
    expect(thereIsLostData).to.eql([ '$__lost_data__' ]);
  });

  it('Data that is lost is caught', () => {
    expect(caughtLostData).to.eql([ 'foo', 'foo']);
  });

  it('Should not catch unlistened too data if not desired', () => {
    const noData = new Emitter(0);

    noData.emit('test', 'foo');

    expect(noData.listSubjects()).to.eql([]);
  });
});
