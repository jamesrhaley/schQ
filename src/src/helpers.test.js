import { expect } from 'chai';
import Emitter from './../emitter/index';
import { Mock } from './helpers';

var emitter = new Emitter();

// init mock by setting its emitter
var mock = new Mock(emitter);

describe('Mock elements helper', () => {
  var results1 = [],
    results2 = [];
  
  // create a place to listen for the mock events to end
  // and to recive data
  emitter.listen('unique', (data) => {
    results1.push('unique:' + JSON.stringify(data));
  });

  emitter.listen('unique2', (data) => {
    results2.push('unique2:' + JSON.stringify(data));
  });


  before(function (done) {
    // create fake data based off of is a number even
    // or odd
    function which(num) {
      let t = num % 2 !== 0 ? 'rendered': 'packed';
      return {
        int: num+1,
        type: t
      };
    }

    // create a object of mock events
    function action1() {
      let groupObject = mock.object(3, { type: 'packed' });

      // exicute events that call setTimeout before
      // transmiting data
      Object.keys(groupObject).forEach((key, byIndex) => {
        groupObject[key]('unique', which(byIndex));
      });
    }

    // create a array of mock events
    function action2() {
      let groupArray = mock.array(3, { type: 'packed' });

      // exicute events that call setTimeout before
      // transmiting data
      groupArray.forEach((fn, byIndex) => {
        fn('unique2', which(byIndex));
      });
    }

    function exicuteAndWatch(action, arr, resolve) {
      //run each test action
      action();

      // check to see if event are finished by
      // checking the length of result and then
      // calling done.
      let ckeckInterval = setInterval(() => {
        if(arr.length === 3) {

          clearInterval(ckeckInterval);   

          resolve('finished');
        }
      }, 50); 
    }

    let promise1 = () => {
      return new Promise(function (resolve) {
        exicuteAndWatch(action1, results1, resolve);
      });
    };

    let promise2 = () => {
      return new Promise(function (resolve) {
        exicuteAndWatch(action2, results2, resolve);
      });
    };

    promise1()
      .then(() => promise2())
      .then(() => done());
  });


  it('Should return async in results1', () => {
    let example = [
      'unique:{"type":"packed","int":1}',
      'unique:{"type":"rendered","int":2}',
      'unique:{"type":"packed","int":3}'
    ];

    expect( results1 ).to.eql( example );
  });

  it('Should return async in results2', () => {
    let example = [
      'unique2:{"type":"packed","int":1}',
      'unique2:{"type":"rendered","int":2}',
      'unique2:{"type":"packed","int":3}'
    ];

    expect( results2 ).to.eql( example );
  }); 
});

