import { expect } from 'chai';
import Emitter from './../emitter/index';
import { runInOrder } from './index';
import { Mock } from './mock';

var emitter = new Emitter();
var mock = new Mock(emitter);

describe('runInOrder', function () {
  const key = 'data3';

  const data = [
    mock.array(3, { type: 'packed' }),
    mock.array(1, { type: 'packed' }),
    mock.array(1, { type: 'packed' })
  ];

  let allDone = false;

  before(function (done) {
    //set do last
    const rio = runInOrder([
      [
        () => {
          allDone = true;
          done();
        }
      ]
    ]);

    const arrFrom = rio(emitter, data, key);

    arrFrom.subscribe((x) => {
      let funcs = x.next;

      funcs.forEach(fn => {
        fn(key);
      });
    });
    
  });

  it('Test completes', () => {
    expect(allDone).to.be.true;
  });
  
  it('Should use default settings', () => {
    expect(runInOrder()(emitter, data, key)).to.be.truthy;
  });
});
