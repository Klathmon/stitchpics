var workerBehavior = {
  properties: {
    workers: {
      type: Array,
      value: []
    }
  },

  createWorkers: function(url, numWorkers){
    //Create new workers
    for(var x = 0; x < numWorkers; x++){
      this.workers.push({
        working: false,
        worker: new Worker(this.resolveUrl(url))
      });
    }
  },

  dispatchWorker: function(callback, command, data, transferrable){
    var foundWorker = false;

    this.workers.forEach(function(workerObj, index){
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

  buildImageDataFromBuffer: function(buffer, width, height){
    return new ImageData(
      new Uint8ClampedArray(buffer),
      width,
      height
    );
  },
};
