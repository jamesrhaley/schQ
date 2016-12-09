import Emitter from './emitter';
import {expect} from 'chai';

const emitter = new Emitter();

describe('emitter', () => {
  let value = undefined;
  
  emitter.listen('data', function (data) {
    value = 'data: ' + data;
  });

  emitter.emit('data', 'foo');

  it('emitter emitts', () => {
    expect(value).to.equal('data: foo');
  });
});

