import {expect} from 'chai';
import { objectValues } from './utils';

describe('objectValues', () => {
  it('Converts a simple obect to an Array of values', () => {
    let obj = {'a':2,'b':3};
    
    expect(objectValues(obj)).to.deep.equal([2,3]);
  });
});
