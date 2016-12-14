import {expect} from 'chai';
import objToArray from './util';

describe('objToArray', () => {
  it('Converts a simple obect to an Array of values', () => {
    let obj = {'a':2,'b':3};
    
    expect(objToArray(obj)).to.deep.equal([2,3]);
  });
});
