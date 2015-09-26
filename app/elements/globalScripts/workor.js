class Workor {

  constructor(){
    this._createWorkers(navigator.hardwareConcurrency || 4);
  }

  dispatchWorker(func, funcParams, transferrable = []){
    return new Promise((resolve, reject)=>{
      let worker = this.workerPool.pop();

      worker.runFunction.transfer(func.toString(), funcParams, transferrable,(result)=>{
        this.workerPool.unshift(worker);
        resolve(result);
      });
    });
  }

  _createWorkers(numberOfWorkers){
    this.workerPool = _.times(numberOfWorkers * 3, ()=>{
      let worker = Workor._genWorker();
      worker.myImportScripts(window.location.origin + '/elements/globalScripts/globalScripts.js', (stuff)=>{
        console.log('script imported!');
      });
      return worker;
    });
  }

  static _genWorker(){
    return operative({
      runFunction: function(funcString, arrayOfParams, callback){
        eval('var workerContextFunc = ' + funcString); // jshint ignore:line
        let [retval, transferrable] = workerContextFunc(...arrayOfParams);
        callback.transfer(retval, transferrable || []);
      },

      myImportScripts: function(scriptPath, callback){
        importScripts(scriptPath);
        callback('stuff');
      }
    });
  }

}
