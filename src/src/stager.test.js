import { expect } from 'chai';
import { 
  eventListener,
  queueDump,
  stageStream
} from './stager';
import Emitter from './../emitter/index';
import { isFunction } from './utils';


let emitter = new Emitter(0);

describe('stager', () => {
  let listenerResult, streamResult;

  before(function(done) {
    
    const key = 'listernerTestKey';

    const eventTest = new Promise (resolve => {

      eventListener(emitter, key)
        .startWith(undefined)
        .take(2)
        //delay hack
        .delay(0)
        .subscribe(data => {

          if (data !== undefined) {
            
            resolve({data, emitter, });
          }

          emitter.emit(key, true);
        });
    });

    const streamConcatTest = (emitter, key) => new Promise (resolve => {
      let testKey = key+1;
      let queue = queueDump([() => true]);
      let listener = eventListener(emitter, testKey);
      let results = {};

      stageStream(queue, listener)
        .take(2)
        //delay hack
        .delay(0)
        .subscribe(data => {
    
          if (!isFunction(data[0])) {

            results.theTruth = data;
 
            resolve(results);

          } 

          else {

            results.isFunc = isFunction(data[0]);

            emitter.emit(testKey, data[0]());
          }
        });
    });

    // perform tests in sequence
    eventTest
      .then(resolve => {
        let {data, emitter, key} = resolve;

        listenerResult = data;
        
        return streamConcatTest(emitter, key);
      })
      .then(resolve => {

        streamResult = resolve;
        
        done();
      });
  });

  describe('eventListener', () => {
    it('should return an observable after receiving an emit', () => {
      expect( listenerResult ).to.be.true;
    });
  });

  describe('stageStream', () => {
    it('should run observable function stream first', () => {
      expect( streamResult.isFunc ).to.be.true;
    });

    it('Then it should capture the emit stream as true', () => {
      expect( streamResult.theTruth ).to.be.true;
    });
  });
});