class Workor {

  constructor(numberOfWorkers = 4){
    operative.setSelfURL('elements/workor/workorCompiled.js');
    this.workerPool = _.times(numberOfWorkers, ()=>this._genWorker());
  }

  dispatchWorker(func, funcParams, transferrable = []){
    return new Promise((resolve, reject)=>{
      this._dispatchWorkerWait(func, funcParams, transferrable, resolve, reject);
    });
  }

  _dispatchWorkerWait(...params){
    let worker = this.workerPool.pop();
    if(typeof worker === 'undefined'){
      setTimeout(this._dispatchWorkerWait.bind(this), 1, ...params);
    }else{
      let [func, funcParams, transferrable, resolve, reject] = params;
      worker.transfer(func.toString(), funcParams, transferrable,(result)=>{
        this.workerPool.unshift(worker);
        resolve(result);
      });
    }
  }

  _genWorker(){
    return operative(function(funcString, arrayOfParams, callback){
      eval('var workerContextFunc = ' + funcString); // jshint ignore:line
      let [retval, transferrable] = workerContextFunc(...arrayOfParams);
      callback.transfer(retval, transferrable || []);
    }, ['elements/globalScripts/globalScripts.js']);
  }

}
