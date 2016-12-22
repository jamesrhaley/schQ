import {expect} from 'chai';
import Emitter from './../emitter/index';
import { waitAndListen } from './index';

const emitter = new Emitter();
const randomTime = () => Math.random()*1000;

describe('waitForListen', () => {  
  let result1 = undefined;
  let result2 = undefined;

  before(function(done){
    this.timeout(0);

    for (let i = 0; i < 4; i++) {

      setTimeout(
        function () {
          return emitter.emit('data1','wait1');
        },
        randomTime()
      );

      // delay second group
      setTimeout(
        function () {
          return setTimeout(
            function () {
              return emitter.emit('data2','wait2');
            },
            randomTime()
          );
        }, 
        100
      );
    }

    // race conditions are causeing a problem
    // with the test
    waitAndListen(emitter, 4, 'data1')
      .subscribe(val => {

        result1 = val;   
      });

    waitAndListen(emitter, 4, 'data2')
      .subscribe(val2 => {
        
        result2 = val2;
      });
    
    // set up an interval to make sure both test finish
    // by checking if vars are no longer undefined
    // then call done
    let time = 0;
    let interval = 250;
    let testInterval = setInterval(() => {
      if (result1 !== undefined && result2 !== undefined) {

        clearInterval(testInterval);

        done();

      } else if (time === 2500) {

        clearInterval(testInterval);

        done();        
      }

      time += interval;
    }, interval);
  });

  it('1 should return "data1" with 4 entries captured from event', () => {
    expect( result1.events.length ).to.equal(4);
  });

  it('1 should return "data1" as it`s key', () => {
    expect( result1.key ).to.equal('data1');
  });

  it('2 should return "data2" with 4 entries captured from event', () => {
    expect( result2.events.length ).to.equal(4);
  });

  it('2 should return "data2" as it`s key', () => {
    expect( result2.key ).to.equal('data2');
  });

  it('Emitter should be empty"', () => {
    expect( emitter.listSubjects() ).to.eql([]);
  });
});



