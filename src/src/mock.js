import { isArray } from './utils';

/**
 * for esdoc
 * @ignore
 */
export var randomTime = () => Math.random()*100;

/**
 * for esdoc
 * @ignore
 */
export class Mock{
  constructor(emitter){
    this._emitter = emitter;
    this._randomTime = randomTime;
  }

  object(groups, refPackage) {
    var testObject = {},
      ifArray = isArray(groups),
      count = ifArray ? groups.length : groups;

    for (let i = 0; i < count; i++) {
      let objectKey = ifArray ? groups[i] : i;

      testObject[objectKey] = (key, uniquePackage) => 
        setTimeout(() => {
          this._emitter.emit(
            key,
            Object.assign({}, refPackage, uniquePackage),
            this._randomTime()
          );
        });
    }

    return testObject;
  }

  array(count, refPackage) {
    var testArray = [];
    var emitter = this._emitter;
    for (let i = 0; i < count; i++) {

      testArray.push( (key, uniquePackage) => 
        setTimeout(() => 
          emitter.emit(
            key,
            Object.assign({}, refPackage, uniquePackage),
            this._randomTime()
          )
        )
      );
    }

    return testArray;
  }
}

/**
 * for esdoc
 * @ignore
 */
export const mocksmall = function(){

  return {
    object : function(groups, refPackage) {
      let build = {};
      let ifArray = isArray(groups);
      let count = ifArray ? groups.length : groups;

      for (let i = 0; i < count; i++) {
        let objectKey = ifArray ? groups[i] : i;

        build[objectKey] = (key, uniquePackage, cb) => {
          return cb(key, refPackage, uniquePackage);
        };
      }

      return build;
    },

    array : function(count, refPackage) {
      let build = [];

      for (let i = 0; i < count; i++) {

        build.push( 
          (key, uniquePackage, cb) => {
            return cb(key, refPackage, uniquePackage);
          }
        );
      }

      return build;
    }
  };
};

/**
 * for esdoc
 * @ignore
 */
export function loadEmitter(emitter) {
  return (key, oldpack, newPack) => {
    return setTimeout( 
      () => emitter.emit(
        key,
        Object.assign({}, oldpack, newPack)
      ),
      randomTime()
    );
  };
}

