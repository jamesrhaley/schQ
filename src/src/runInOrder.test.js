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
  let allEvents = [];
  let functionCount = 0;

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
      let {next, message} = x;
      let {previous} = message;

      if (previous) {
        allEvents.push(previous);
      }

      next.forEach(fn => {
        functionCount++;

        fn(key);
      });
    });
  });

  it('Test completes', () => {
    expect(allDone).to.be.true;
  });

  it('3 Events stream should have returned via event emitter', () => {
    expect(allEvents.length).to.equal(3);
  });

  it('The first event should have 3 events', () => {
    expect(allEvents[0].length).to.equal(3);
  });

  it('The next two events only had one occur', () => {
    expect(allEvents[1].length).to.equal(1);
    expect(allEvents[2].length).to.equal(1);
  });

  it('A total of 6 functions occured including doLast', () => {
    expect(functionCount).to.equal(6);
  });

  it('Should use default settings', () => {
    expect(runInOrder()(emitter, data, key)).to.be.truthy;
  });
});
