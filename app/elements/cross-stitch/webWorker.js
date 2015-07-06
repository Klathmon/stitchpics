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

      var newImageData = pixelateBehavior.pixelate(imageData, eventData.fitObj);

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


    var runFunction = function(passedObj){
      // funcName = the function name to be run
      // Index must be supplied
      // imageDataBuffer, imageDataWidth, imageDataHeight get autoconverted to first argument as imageData
      // Args is an array of the rest of the aruments

      var imageData = workerBehavior.buildImageDataFromBuffer(
        passedObj.imageDataBuffer,
        passedObj.imageDataWidth,
        passedObj.imageDataHeight
      );

      var args = [imageData].concat(passedObj.args);

      var newImageData = self.crossStitchBehavior[passedObj.funcName].apply(crossStitchBehavior, args);

      var returnMessage = {
        index: passedObj.index,
        imageDataBuffer: newImageData.data.buffer,
        imageDataWidth: newImageData.width,
        imageDataHeight: newImageData.height
      };

      self.postMessage(returnMessage, [returnMessage.imageDataBuffer]);
    };
  }
})();
