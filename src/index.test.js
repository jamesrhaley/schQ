import {expect} from 'chai';

describe('basic async test', function(){  
  let foo = false;

  before(function(done){
    setTimeout(function(){
      foo = true;

      done();
    }, 1000);
  });

  it('should pass', function(){   
    expect(foo).equals(true);
  });
});
