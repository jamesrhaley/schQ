import {expect} from 'chai';
import objToArray from './util';

describe('objToArray', function() {
  it('should work', function() {
    var obj = {'a':2,'b':3};
    
    expect(objToArray(obj)).to.deep.equal([2,3]);
  })
})
