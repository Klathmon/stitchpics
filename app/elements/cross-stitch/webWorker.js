(function() {
  'use strict';
  if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope){
    // If we get here then this is a worker!

    var runFunction = function(obj, func, eventData, otherJunk){
      var imageData = workerBehavior.buildImageDataFromBuffer(
        eventData.imageDataBuffer,
        eventData.imageWidth,
        eventData.imageHeight
      );

      var newImageData = self[obj][func].apply(self[obj], [imageData].concat(otherJunk));

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
        runFunction('pixelateBehavior', 'pixelate', data, [data.fitObj]);
      }else if(command === 'quantize'){
        runFunction('crossStitchBehavior', 'quantize', data, [data.palette]);
      }
    }, false);
  }
})();
