export var randomTime = () => Math.random()*100;

export function Mock(emitter){
  this._emitter = emitter;
  this._randomTime = randomTime;

}

Mock.prototype.object =  function (key, count, refPackage) {
  var testObject = {};

  for (let i = 0; i < count; i++) {

    testObject[i] = (uniquePackage) => 
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