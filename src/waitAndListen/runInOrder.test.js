import {expect} from 'chai';
import Emitter from './../emitter/index';
import {runInOrder} from './index';

var emitter = new Emitter();
var randomTime = () => Math.random()*100;

describe('runInOrder', function (){
  let arr = [41,21,7,31];
  let total = arr.reduce((a,b) => a+b);
  let count = 0;
  let allDone = false;

  before(function (done){
    const key = 'data3';
    const arrFrom = runInOrder(emitter, arr, key);

    arrFrom
    .subscribe({
      onNext: (x) =>{
        const times = x[1];

        // the negative timve kills process by 
        // default
        for (let i = 0; i < times; i++) {
          setTimeout(() => {

            count++;

            emitter.emit(key, 'foo');

          }, randomTime());
        }

      },
      onError: (e) => console.error(e),
      onCompleted: () => {
        
        allDone = true;
        
        done();
      }
    });
    
  });

  it('Test should happen 100 times', function () {
    expect(count).to.equal(total);
  });

  it('Test completes', function () {
    expect(allDone).to.be.true;
  });
});
