import Rx from 'rx';
import objToArray from './../util';

function waitFor(num){
  return Rx.Observable.create(observer => {
    const watchers = {};
    let count = 0;
    
    for(let i = 0; i < num; i++) {
      let key =`$${i+1}`;
      
      watchers[key] = Rx.Observable.of(true)
        .delay(Math.random()*10);
    }
    
    const all = Rx.Observable
      .concat(objToArray(watchers))
      .subscribe(() => {
        
        count++;

        if(count === num){

          observer.onNext(true);

          observer.onCompleted();
        }     
      });

    return () => all.dispose();
  });                 
}

export default waitFor;