import {expect} from 'chai';
import Rx from 'rx';
import waitFor from './waitFor';

const asynTest = (val => {
   describe('waitFor', function() {
    it('should return true after awhile', function() {
      expect(val).to.be.true;
    })
  }) 
})


waitFor(4)
  .subscribe(val => {

    asynTest(val)

    run();

  });
