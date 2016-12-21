import {expect} from 'chai';
import processIncoming from './processIncoming';
import Emitter from './../emitter/index';
import { Mock } from './helpers';

var emitter = new Emitter();
var mock = new Mock(emitter);

let key = 'process';

let groupArray1 = mock.array(key, 3, { type: 'packed' });

let groupArray2 = mock.object(key, 1, { type: 'packed' });

let groupArray3 = mock.object(
  key, 
  ['enter', 'update', 'post', 'exit'],
  { type: 'packed' }
);

let all = processIncoming([groupArray1, groupArray2, groupArray3, () => {}]);

let badArray = [[1,2,3], groupArray2];
let badObject = [{enter:'str'}];

describe('incomingProcess', function() {
  it('Should be an Array of Arrays', function() {
    expect(Array.isArray(all[0])).to.be.true;
    expect(Array.isArray(all[1])).to.be.true;
    expect(Array.isArray(all[2])).to.be.true;
    expect(Array.isArray(all[3])).to.be.true;
    expect(Array.isArray(all[4])).to.be.true;
    expect(Array.isArray(all[5])).to.be.true;
    expect(Array.isArray(all[6])).to.be.true;
    expect(all[7] === undefined).to.be.true;
  });

  it('Should error when an Array index is not a function', function() {
    expect(() => processIncoming(badArray)).to.throw(/Array/);
  });

  it('Should error when an Object value is not a function', function() {
    expect(() => processIncoming(badObject)).to.throw(/Object/);
  });

  it('Should be an Array of Arrays, Objects, or Functions', function() {
    expect(() => processIncoming([1,2,3])).to.throw(/Array of Objects, Arrays, or Functions/);
  });
});

