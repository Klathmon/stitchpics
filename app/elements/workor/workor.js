class Workor {

  constructor(numberOfWorkers = 4){
    operative.setSelfURL(this._getPathToElements() + 'workor/workorCompiled.js');
    this._workerPool = _.times(numberOfWorkers, ()=>this._genWorker());
  }

  dispatchWorker(func, funcParams, transferrable = []){
    return new Promise((resolve, reject)=>{
      this._dispatchWorkerWait(func, funcParams, transferrable, resolve, reject);
    });
  }

  _dispatchWorkerWait(...params){
    let worker = this._workerPool.pop();
    if(typeof worker === 'undefined'){
      setTimeout(this._dispatchWorkerWait.bind(this), 1, ...params);
    }else{
      let [func, funcParams, transferrable, resolve, reject] = params;
      worker.transfer(func.toString(), funcParams, transferrable,(result)=>{
        this._workerPool.unshift(worker);
        resolve(result);
      });
    }
  }

  _genWorker(){
    return operative(function(funcString, arrayOfParams, callback){
      eval('var workerContextFunc = ' + funcString); // jshint ignore:line
      let [retval, transferrable] = workerContextFunc(...arrayOfParams);
      callback.transfer(retval, transferrable || []);
    }, [this._getPathToElements() + 'globalScripts/globalScripts.js']);
  }

  _getPathToElements(){
    return window.location.origin + '/elements/';
  }

}
