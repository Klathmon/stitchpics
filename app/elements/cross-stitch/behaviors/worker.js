(function() {
  'use strict';
  var workerBehavior = {

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

    dispatchWorker(callback, command, data, transferrable){
      var foundWorker = false;

      _.forEach(this.workers, function(workerObj, index){
        if( !foundWorker && !workerObj.working){
          //Found a worker that's not doing anything right now.
          foundWorker = true;
          workerObj.working = true;

          // Run this when the worker finishes up
          var workerDone = function(event){
            workerObj.worker.removeEventListener('message', workerDone, false);
            workerObj.working = false;
            callback.bind(this)(event);
          }.bind(this);

          // Attach the listener
          workerObj.worker.addEventListener('message', workerDone, false);

          // And setup then send the message
          data.command = command;
          workerObj.worker.postMessage(data, transferrable);
        }
      }, this);
    },

    buildImageDataFromBuffer(buffer, width, height){
      return new ImageData(
        new Uint8ClampedArray(buffer),
        width,
        height
      );
    },
  };

  if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope){
    self.workerBehavior = workerBehavior;
  }else{
    window.workerBehavior = workerBehavior;
  }
})();
