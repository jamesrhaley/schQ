export var randomTime = () => Math.random()*100;

export function Mock(emitter){
  this._emitter = emitter;
  this._randomTime = randomTime;

}

Mock.prototype.object =  function (key, groups, refPackage) {
  var testObject = {};
  let ifArray = Array.isArray(groups);
  let count = ifArray ? groups.length : groups;

  for (let i = 0; i < count; i++) {
    let objectKey = ifArray ? groups[i] : i;

    testObject[objectKey] = (uniquePackage) => 
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

Mock.prototype.array =  function (key, count, refPackage) {
  var testArray = [];

  for (let i = 0; i < count; i++) {

    testArray.push( (uniquePackage) => 
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