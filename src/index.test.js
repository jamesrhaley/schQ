import {expect} from 'chai';
import main from './index';

describe('Is an object', () => {

  it('type of main is Object', () => {
    expect(typeof main === 'object').to.be.true;
  });
});
