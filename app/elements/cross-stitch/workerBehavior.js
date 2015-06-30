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

if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope){
  // If we get here then this is a worker!

  // Import Scripts
  importScripts('crossStitchBehavior.js', '../../bower_components/RgbQuant.js/src/rgbquant.js');

  var quantize = function(eventData){

    var imageData = workerBehavior.buildImageDataFromBuffer(
      eventData.imageDataBuffer,
      eventData.imageWidth,
      eventData.imageHeight
    );

    var newImageData = crossStitchBehavior.quantize(imageData, eventData.palette);

    var returnMessage = {
      index: eventData.index,
      imageDataBuffer: newImageData.data.buffer,
      imageWidth: newImageData.width,
      imageHeight: newImageData.height
    };

    self.postMessage(returnMessage, [returnMessage.imageDataBuffer]);
  };

  var pixelate = function(eventData){

    var imageData = workerBehavior.buildImageDataFromBuffer(
      eventData.imageDataBuffer,
      eventData.imageWidth,
      eventData.imageHeight
    );

    var newImageData = crossStitchBehavior.pixelate(imageData, eventData.fitObj);

    var returnMessage = {
      index: eventData.index,
      imageDataBuffer: newImageData.data.buffer,
      imageWidth: newImageData.width,
      imageHeight: newImageData.height
    };

    self.postMessage(returnMessage, [returnMessage.imageDataBuffer]);
  };

  self.addEventListener('message', function(event){
    var data = event.data;
    var command = data.command;

    if(command === 'pixelate'){
      pixelate(event.data);
    }else if(command === 'quantize'){
      quantize(event.data);
    }
  }, false);
};
