import {expect} from 'chai';
import * as schQ from './index';

describe('Is an object', () => {

  it('type of main is Object', () => {
    expect(typeof schQ === 'object').to.be.true;
  });
});
