import {expect} from 'chai';
import processIncoming from './processIncoming';
import Emitter from './../emitter/index';
import { Mock } from './helpers';

var emitter = new Emitter();
var mock = new Mock(emitter);

let group1 = mock.array(3, { type: 'packed' });

let group2 = mock.object(1, { type: 'packed' });

let group3 = mock.object(
  ['enter', 'update', 'post', 'exit'],
  { type: 'packed' }
);

let all = processIncoming([group1, group2, group3, () => {}]);

let badArray = [[1,2,3], group2];
let badObject = [{enter:'str'}];

describe('incomingProcess', () => {
  it('Should be an Array of Arrays', () => {
    expect(Array.isArray(all[0])).to.be.true;
    expect(Array.isArray(all[1])).to.be.true;
    expect(Array.isArray(all[2])).to.be.true;
    expect(Array.isArray(all[3])).to.be.true;
    expect(Array.isArray(all[4])).to.be.true;
    expect(Array.isArray(all[5])).to.be.true;
    expect(Array.isArray(all[6])).to.be.true;
    expect(all[7] === undefined).to.be.true;
  });

  it('Should error when an Array index is not a function', () => {
    expect(() => processIncoming(badArray)).to.throw(/Array/);
  });

  it('Should error when an Object value is not a function', () => {
    expect(() => processIncoming(badObject)).to.throw(/Object/);
  });

  it('Should be an Array of Arrays, Objects, or Functions', () => {
    expect(() => processIncoming([1,2,3])).to.throw(/Array of Objects, Arrays, or Functions/);
  });
});

