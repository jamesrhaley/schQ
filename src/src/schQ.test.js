import { expect } from 'chai';
import { mocksmall, loadEmitter } from './mock';
import SchQ from './index';
import { doLast, checkout } from './index';

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
    passedData = [],
    count;

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

    function pushResults(str) {
      let getArray = str === 'process1' ? array1 : array2;
      getArray.push(str);
    }

    let numberState = 0;

    count = 0;
    
    schQ
      .run()
      .subscribe( 
        (packet) => {
          let { message, next } = packet;
          let { key, previous } = message;

          count++;

          if ( key === 'process1' && count === 2 ) {
            run(++i);
          }

          if ( count === 3 ) {
            midObservers = schQ.emitter().listSubjects();
          }

          if ( count === 9 ) {
            endObservers = schQ.emitter().listSubjects();
          }

          pushResults(key);

          if (previous) {

            numberState += previous.length;
          }

          passedData.push(previous);

          next.forEach(fn => {

            fn(key, {test:i+numberState}, makePackage);

          });
        },
        (e) => console.error(e),
        () => console.warn('Complete')
      );
  });

  it('Total action should be 9', () => {
    expect( count ).to.be.equal(9);
  });

  it('Fist push of data should cancel after two events', () => {
    expect( array1.length ).to.equal( 2 );
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

describe('doLast and checkout', () => {

  it('doLast should return undefined', () => {
    expect( doLast[0][0]() ).to.equal( undefined );    
  });

  it('checkout should get the length of an array', () => {
    expect( checkout(doLast) ).to.equal( 1 );
  });
});