import {expect} from 'chai';
import waitFor from './index';

describe('waitFor', function () {  
  let result = false;

  before(function (done) {

    this.timeout(0);

    waitFor(4)
      .subscribe(val => {
        
        result = val;

        done();
      });
  });

  it('should return true after awhile', function () {
    expect(result).to.be.true;
  });
});
