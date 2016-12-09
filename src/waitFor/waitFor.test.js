'use strict';

var expect = require('chai').expect;
var waitFor = require('./waitFor');

waitFor(4)
  .subscribe(val => {
    console.log(val);
  });
  
describe('something', function() {
  it('should work', function() {
    expect(true).to.be.true;
  })
})