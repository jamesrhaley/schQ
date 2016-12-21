import {expect} from 'chai';
import Emitter from './../emitter/index';
import { Mock } from './helpers';
import { SchQ } from './index';

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

let all = [groupArray1, groupArray2, groupArray3];

var schQ = new SchQ(emitter);

schQ.loader(all, key);

var s = schQ.run();

s.subscribe(
  x => {
    let funcs = x[1];

    funcs.forEach(fn => {
      fn();
    });
  },
  (e) => console.error(e),
  () => console.log('Complete')
);

describe('SchQ', function() {
  it('Should work', function() {
    expect(true).to.be.true;
  });
});