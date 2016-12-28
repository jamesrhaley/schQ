/**
 * @private
 */
export var randomTime = () => Math.random()*100;

/**
 * @private
 */
export function Mock(emitter){
  this._emitter = emitter;
  this._randomTime = randomTime;

}

Mock.prototype.object =  function (groups, refPackage) {
  var testObject = {};
  let ifArray = Array.isArray(groups);
  let count = ifArray ? groups.length : groups;

  for (let i = 0; i < count; i++) {
    let objectKey = ifArray ? groups[i] : i;

    testObject[objectKey] = (key, uniquePackage) => 
      setTimeout(() => 
        this._emitter.emit(
          key,
          Object.assign({}, refPackage, uniquePackage),
          this._randomTime()
        )
      );
  }

  return testObject;
};

Mock.prototype.array =  function (count, refPackage) {
  var testArray = [];

  for (let i = 0; i < count; i++) {

    testArray.push( (key, uniquePackage) => 
      setTimeout(() => 
        this._emitter.emit(
          key,
          Object.assign({}, refPackage, uniquePackage),
          this._randomTime()
        )
      )
    );
  }

  return testArray;
};