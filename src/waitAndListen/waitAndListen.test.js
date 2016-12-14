import {expect} from 'chai';
import Emitter from './../emitter/index';
import waitAndListen from './index';

const emitter = new Emitter();
const randomTime = () => Math.random()*1000;

describe('waitForListen', function (){  
  let result1 = undefined;
  let result2 = undefined;

  before(function(done){
    this.timeout(0);

    for (let i = 0; i < 4; i++) {

      setTimeout(
        function () {
          return emitter.emit('data1');
        },
        randomTime()
      );

      // delay second group
      setTimeout(
        function () {
          return setTimeout(
            function () {
              return emitter.emit('data2');
            },
            randomTime()
          );
        }, 
        100
      );
    }

    // race conditions are causeing a problem
    // with the test
    waitAndListen(emitter, 'data1', 4)
      .subscribe(val => {

        result1 = val;   
      });

    waitAndListen(emitter, 'data2', 4)
      .subscribe(val2 => {
        
        result2 = val2;
      });
    
    // set up an interval to make sure both test finish
    // by checking if vars are no longer undefined
    // then call done
    let time = 0;
    let interval = 250;
    let testInterval = setInterval(()=>{
      if (result1 !== undefined && result2 !== undefined){

        clearInterval(testInterval);

        done();

      } else if (time === 2500) {

        clearInterval(testInterval);

        done();        
      }

      time += interval;
    }, interval);
  });

  it('1 should return "data1: finished"', function (){
    expect(result1).to.equal('data1: finished');
  });

  it('2 should return "data2: finished"', function (){
    expect(result2).to.equal('data2: finished');
  });

  it('Emitter should be empty"', function (){
    expect(emitter.listObservers()).to.eql([]);
  });
});



