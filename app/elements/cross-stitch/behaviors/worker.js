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

            // Setup the completed function
            var workerDone = (event)=>{
              workerObj.worker.removeEventListener('message', workerDone, false);
              workerObj.working = false;
              resolve(event.data);
            };

            // Attach the listener
            workerObj.worker.addEventListener('message', workerDone, false);

            // Then send the message
            workerObj.worker.postMessage([func, data], transferrable);
          }
        };
        wait(func, data, transferrable);
      });
    },

    receiveWork(event){
      var [func, data] = event.data;
      var merged = _.merge( self.workerBehavior, self.sizingBehavior, self.quantizeBehavior, self.pixelateBehavior, self.miscBehavior, self.dmcColorBehavior);

      merged[func].bind(merged)(data)
        .then(({data: returnData, transferrable: returnTransferrable} = {transferrable: []})=>{
          self.postMessage(returnData, returnTransferrable);
        }).catch(merged._catchErrors);
    },

    encodeResolve(data, transferrable){
      if(isInsideWorker()){
        return {data, transferrable};
      }else{
        return data;
      }
    },

  };

  self.workerBehavior = behavior;

  // If we are inside a worker currently, then attach the listener
  if (isInsideWorker()){
    self.addEventListener('message', self.workerBehavior.receiveWork, false);
  }
})();
