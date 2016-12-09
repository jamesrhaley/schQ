"use strict";

function objToArray(obj) {
  var keys = Object.keys(obj);
  return keys.map(function (key) {
    return obj[key];
  });
}

module.exports = objToArray;