class Workor {

  //Change this to dispatch each worker to an already running worker...

  static dispatchWorker(func, funcParams, transferrable = []){
    return new Promise((resolve, reject)=>{
      let worker = operative(func, ['elements/globalScripts/globalScripts.js']);

      worker.transfer(...funcParams, transferrable).then(function(result){
        resolve(result);
        worker.terminate();
      });
    });
  }
}
