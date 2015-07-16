(function() {
  'use strict';
  var behavior = {

    properties: {
      workers: {
        type: Array,
        value: []
      }
    },

    createWorkers(url, numWorkers){
      //Create new workers
      this.workers = _.times(numWorkers, function(){
        return {
          working: false,
          worker: new Worker(this.resolveUrl(url))
        };
      }, this);
    },

    dispatchWorker(func, data, transferrable){
      return new Promise((resolve, reject)=>{
        var wait = (data, callback)=>{
          var workerObj = _.findWhere(this.workers, {
            working: false
          });
          if(typeof workerObj === "undefined"){
            // If ther earen't any free workers, wait a bit and try looking again...
            setTimeout(wait, 100, func, data, transferrable);
          } else {
            // We have a free worker here!
            workerObj.working = true;

            // Setup the completed function
            var workerDone = (event)=>{
              workerObj.worker.removeEventListener('message', workerDone, false);
              workerObj.working = false;
              resolve(event.data);
            };

            // Attach the listener
            workerObj.worker.addEventListener('message', workerDone, false);

            // Then send the message
            workerObj.worker.postMessage({func, data}, transferrable); // Don't use transferrable stuff now, it's a bit of a pain in the ass
          }
        };
        wait(func, data, transferrable);
      });
    },
  };



  var obj;
  if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope){
    obj = self;
  }else{
    obj = window;
  }
  obj.workerBehavior = behavior;
})();
