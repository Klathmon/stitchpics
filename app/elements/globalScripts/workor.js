class Workor {

  /**
   * Creates the object
   */
  constructor(numberOfWorkers, functions){

    this.workers = [];

    _.times(numberOfWorkers, ()=>{
      this.workers.push({
        working: false,
        worker: operative(functions, ['elements/globalScripts/globalScripts.js'])
      });
    });
  }


  dispatchWorker(functionName, params, transferrable){
    return new Promise((resolve, reject)=>{
      var wait = (func, data, transferrable)=>{
        var workerObj = _.findWhere(this.workers, {
          working: false
        });
        if(typeof workerObj === "undefined"){
          // If ther earen't any free workers, wait a bit and try looking again...
          setTimeout(wait, 100, func, data, transferrable);
        } else {
          // We have a free worker here!
          workerObj.working = true;

          workerObj.worker[func].transfer(...params, transferrable).then((result)=>{
            workerObj.working = false;
            resolve(result);
          });
        }
      };
      wait(func, data, transferrable);
    });
  }
}
