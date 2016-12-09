import {expect} from 'chai';
import waitFor from './waitFor';

const asynTest = (val => {
  describe('waitFor', () => {
    it('should return true after awhile', () => {
      expect(val).to.be.true;
    });
  });
});


waitFor(4)
  .subscribe(val => {

    asynTest(val);

  });
