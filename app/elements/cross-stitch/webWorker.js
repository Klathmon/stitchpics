(function() {
  'use strict';
  if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope){
    // If we get here then this is a worker!

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


  }
})();
