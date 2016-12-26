import { expect } from 'chai';
import validate from './validate';


describe('validate', () => {
  let bool = () => true;
  let obj = {fn:bool};
  
  it('works', () => {
    expect( validate(obj, obj).fn() ).to.equal(bool());
  });

  it('works if second arg is not defined', () => {
    expect( validate(obj).fn() ).to.equal(bool());
  });

  it('thows a bad key', () => {
    expect( () => validate(obj, {cn:bool}) )
      .to.throw(/only contain one or more/);
  });

  it('thows when a type is wrong', () => {
    expect( () => validate(obj, {fn:0}) )
      .to.throw(/Type of/);
  });
});