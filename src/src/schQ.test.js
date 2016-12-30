import { expect } from 'chai';
import { mocksmall, loadEmitter } from './helpers';
import SchQ from './index';

const containIn = (arr, times, what) => {
  return arr.reduce((pre, curr) => {
    if(curr === what) {
      return pre + 1;
    } else {
      return pre;
    }
  }, 0);
};

let i = 0;

describe('SchQ', () => {
  let midObservers,
    endObservers,
    array1 = [],
    array2 = [],
    passedData = [];

  before(function(done) {
    const key = 'process';
    const schQ = new SchQ({
      lostData : 2,
      doLast : [[
        ()=> {
          /** it is possible for this to be called more than once */
          if (i > 1) done();
        }
      ]]
    });

    const makePackage = loadEmitter(schQ.emitter());

    const mock = mocksmall();

    const all = () => [
      mock.array(3, { type: 'threeInARow' }),
      mock.object(1, { type: 'oneInARow' }),
      mock.object(
        ['enter', 'update', 'post', 'exit'],
        { type: 'fourInARow' }
      )
    ];

    const run = (j) =>schQ.loader(all(), key+j);

    run(++i);

    setTimeout(
      () => {
        midObservers = schQ.emitter().listSubjects();
      },
      8
    );

    setTimeout(
      () => {
        endObservers = schQ.emitter().listSubjects();
      },
      250
    );

    function pushResults(str) {
      let getArray = str === 'process1' ? array1 : array2;
      getArray.push(str);
    }

    let numberState = 0;

    schQ
      .run()
      .subscribe(
        x => {
          let {message, data, listenOn} = x;
          let {key} = message;
          console.log(listenOn.hasObserver(key))
          if(message.key === 'process1') {
            run(++i);
          }
          pushResults(key);

          if (message.events) {

            numberState += message.events.length;
          }

          passedData.push(message.events);

          data.forEach(fn => {

            fn(key, {test:i+numberState}, makePackage);

          });
        },
        (e) => console.error(e),
        () => console.warn('Complete')
      );
  });

  it('Fist push of data should have stopped before completing', () => {
    expect( array1.length < 7 ).to.be.true;
  });

  it('Second push of data should have run 7 times', () => {
    expect( array2.length ).to.equal( 7 );
  });

  it('After Second push "process1" should no longer exist', () => {
    expect( midObservers.indexOf('process1' ) === -1).to.be.true;
  });

  it('And "process2" should exist', () => {
    expect( midObservers.indexOf('$process2' ) >= 0 ).to.be.true;
  });

  it('There should be unused data cause by the second push', () => {
    expect( endObservers.indexOf('$__lost_data__') >= 0 ).to.be.true;
  });

  it('Should have recived data back from cycle', () => {

    expect( containIn(passedData, 2, undefined) )
      .to.be.equal(2);
  });  

  it('Should be able to change the prep fuction', () => {
    const schQ = new SchQ({preprocess: (a,b) => a + b});

    let three = schQ._processData(1,2);

    expect( three ).to.be.equal(3);
  });  

  describe('Can load with an external Emitter', () => {
    let example = new SchQ();

    it('Should be instanceof of SchQ', () => {
      expect( example instanceof SchQ ).to.be.true;    
    });

    it('Should have no emitter Observers when initialized', () => {
      expect( example.emitter().listSubjects() ).to.eql( [] );
    });
  });
});