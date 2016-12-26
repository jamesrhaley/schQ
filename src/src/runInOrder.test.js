import {expect} from 'chai';
import Emitter from './../emitter/index';
import {runInOrder} from './index';
import { Mock } from './helpers';

var rIO = runInOrder();
var emitter = new Emitter();
var mock = new Mock(emitter);

describe('runInOrder', function () {
  const key = 'data3';
  let groupArray1 = mock.array(3, { type: 'packed' });
  let groupArray2 = mock.array(1, { type: 'packed' });
  let groupArray3 = mock.array(1, { type: 'packed' });

  let allDone = false;

  before(function (done) {
    const data = [groupArray1, groupArray2, groupArray3];
    const arrFrom = rIO(emitter, data, key);

    arrFrom
    .subscribe({
      onNext: (x) => {

        let funcs = x.data;

        funcs.forEach(fn => {
          fn(key);
        });
      },
      onError: (e) => console.error(e),
      onCompleted: () => {
        
        allDone = true;
        
        done();
      }
    });
    
  });

  it('Test completes', () => {
    expect(allDone).to.be.true;
  });
});
