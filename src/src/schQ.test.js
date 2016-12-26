import { expect } from 'chai';
import { Mock } from './helpers';
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

describe('SchQ', () => {
  let midObservers,
    endObservers,
    array1 = [],
    array2 = [],
    passedData = [];

  before(function(done) {
    const key = 'process';
    const schQ = new SchQ({lostData:2});
    const mock = new Mock(schQ.emitter());


    const all = () => [
      mock.array(3, { type: 'packed' }),
      mock.object(1, { type: 'packed' }),
      mock.object(
        ['enter', 'update', 'post', 'exit'],
        { type: 'packed' }
      )
    ];

    const run = (j) =>schQ.loader(all(), key+j);

    let i = 0;

    run(++i);

    setTimeout(
      () => {
        let int = ++i;
        run(int);
      },
      7
    );

    setTimeout(
      () => {
        midObservers = schQ.emitter().listSubjects();
      },
      8
    );

    setTimeout(
      () => {
        endObservers = schQ.emitter().listSubjects();
        done();
      },
      250
    );

    function pushResults(str) {
      let getArray = str === 'process1' ? array1 : array2;
      getArray.push(str);
    }

    schQ
      .run()
      .subscribe(
        x => {
          let {message, data} = x;
          let {key} = message;

          pushResults(key);

          passedData.push(message.events);

          data.forEach(fn => {
            fn(key, {test:i});
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
    expect( endObservers ).to.be.eql( [ '$__lost_data__' ] );
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