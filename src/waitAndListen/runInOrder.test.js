import {expect} from 'chai';
import Emitter from './../emitter/index';
import {runInOrder} from './index';
import { Mock } from './helpers';

var emitter = new Emitter();
var mock = new Mock(emitter);


var randomTime = () => Math.random()*100;


describe('runInOrder', function () {
  const key = 'data3';
  let groupArray1 = mock.array(key, 3, { type: 'packed' });
  let groupArray2 = mock.array(key, 1, { type: 'packed' });
  let groupArray3 = mock.array(key, 1, { type: 'packed' });

  let count = 0;
  let allDone = false;

  before(function (done) {
    const data = [groupArray1, groupArray2, groupArray3];
    const arrFrom = runInOrder(emitter, data, key);

    arrFrom
    .subscribe({
      onNext: (x) => {

        let funcs = x[1];

        funcs.forEach(fn => {
          fn();
        });
      },
      onError: (e) => console.error(e),
      onCompleted: () => {
        
        allDone = true;
        
        done();
      }
    });
    
  });

  // it('Test should happen 100 times', function () {
  //   expect(count).to.equal(total);
  // });

  it('Test completes', function () {
    expect(allDone).to.be.true;
  });
});
