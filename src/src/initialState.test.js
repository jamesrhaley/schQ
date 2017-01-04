import {expect} from 'chai';
import { 
  checkTillTrue,
  cacheGate,
  justPass,
  beforeThenAfter
} from './initialState';
import {
  isPromise,
  isFunction
} from './utils';

const reference = {bool: false};
const reference2 = {bool: false};

const stateCheck = (str) => (obj) => obj[str] === true; 

const objectCheck = stateCheck('bool');

describe('the wait', () => {
  let p1, p2, p3, boolValue, cacheResult, justPassResult;

  before(function(done) {

    setTimeout(
      () => {
        reference.bool = true;
      }, 
      10
    );

    p1 = checkTillTrue(reference, objectCheck);

    p2 = new Promise((resolve) => {

      setTimeout(
        () => {
          reference2.bool = true;
        },
        10
      );
      
      let cached = cacheGate(reference2, reference2, objectCheck);

      cached.subscribe(obj => {          
        resolve(obj);
      });      
    });

    p3 = new Promise((resolve) => {
      justPass({}, reference2, objectCheck)
        .subscribe(resolve);
    });

    p1
      .then((resolveBoolen) => {

        boolValue = resolveBoolen;

        return p2;
      })
      .then((resolveObject) => {

        cacheResult = resolveObject;

        return p3;
      })
      .then((justPassObject) => {

        justPassResult = justPassObject;

        done();
      });      
  });

  describe('checkTillTrue', () => {
    it('Should return a promise when a reference state updates', () => {
      expect( isPromise(p1) ).to.be.true;
    });

    it('When resolved that promise should yeild true', () => {
      expect( boolValue ).to.be.true;
    });
  });

  describe('cacheGate', () => {
    it('Should return cache values till a state is verified', () => {
      expect( reference2 ).to.eql( cacheResult );
    });
  });

  describe('justPass', () => {
    it('Should just return the first argument passed to it', () => {
      expect( justPassResult ).to.eql( {} );
    });
  });

  describe('beforeThenAfter', () => {
    let func1 = (obj) => obj.red;
    let func2 = (obj) => obj.blue;
    let verify = (obj) => obj.inc > 1;

    let testObj = {inc:0, red: 'red', blue: 'blue'};

    let copy1 = Object.assign({}, testObj);

    let gate = beforeThenAfter(func1, func2);

    let redResult = gate(copy1, copy1, verify);

    copy1.inc = 5;

    let blueResult = gate(copy1, copy1, verify);
    let blueResult2 = gate(copy1, copy1, verify);

    // lets reset
    let copy2 = Object.assign({}, testObj);
  
    gate = beforeThenAfter(func1, func2);

    let redAfterReset = gate(copy2, copy2, verify);  

    let contiuneBeingRed = gate(copy2, copy2, verify);

    it('Gate Should be a function', () => {
      expect( isFunction(gate) ).to.be.true;
    });

    it('redResult should be red', () => {

      expect( redResult ).to.equal( 'red' );
    });

    it('blueResult should be blue', () => {

      expect( blueResult ).to.equal( 'blue' );
    });

    it('And so should be blueResult2', () => {

      expect( blueResult2 ).to.equal( 'blue' );
    });

    it('redAfterReset should be red', () => {

      expect( redAfterReset ).to.equal( 'red' );
    });

    it('and if state doesn`t change it should still be red', () => {

      expect( contiuneBeingRed ).to.equal( 'red' );
    });
  });

});

