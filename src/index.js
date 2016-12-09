
var Emitter = require('./emitter/emitter');

var emitter1 = new Emitter();
var emitter2 = new Emitter();

var subcription = emitter1.listen('data', function (data) {
  console.log('data: ' + data);
});

emitter2.emit('data', 'foo');
// => data: foo

// Destroy the subscription
subcription.dispose();

function love(name) {
  return name;
}

module.exports = love;