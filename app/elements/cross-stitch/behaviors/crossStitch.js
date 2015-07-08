(function() {
  'use strict';
  var crossStitchBehavior = {

    fit(imageData, xPixels){
      var scale = xPixels / imageData.width;
      var yPixels = Math.floor(imageData.height * scale);

      return {
        xPixels: xPixels,
        yPixels: yPixels,
        pixelWidth: Math.ceil(imageData.width / xPixels),
        pixelHeight: Math.ceil(imageData.height / yPixels)
      };
    },

    split(imageData, numberOfParts, fitObj){
      var imageWidth = imageData.width;
      var imageHeight = imageData.height;

      var chunkHeightExact = Math.floor(imageHeight / numberOfParts);
      var numberOfPixelsHigh = Math.ceil(chunkHeightExact / fitObj.pixelHeight);
      var chunkHeight = numberOfPixelsHigh * fitObj.pixelHeight;

      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      this._writeImageData(canvas, imageData);

      return _.times(numberOfParts, function(chunkNumber){
        var startY = chunkNumber * chunkHeight;

        // If this is the last chunk, add the remainder of pixels that didn't
        // divide evently on to it.
        if(chunkNumber === numberOfParts-1){
          chunkHeight = imageHeight - (chunkHeight * chunkNumber);
        }
        // Push the chunk to the array of chunks
        return context.getImageData(0, startY, imageWidth, chunkHeight);
      });
    },

    stitch(chunks, canvas){
      var imageWidth = chunks[0].width;
      var imageHeight = chunks.reduce(function(runningTotal, chunk){
        return runningTotal + chunk.height;
      }, 0);

      canvas.width = imageWidth;
      canvas.height = imageHeight;

      var context = canvas.getContext('2d');

      _.forEach(chunks, function(chunk, index){
        // Use the first chunk's height as the multiplier.
        // As the last one is different, so it will be offset by the difference
        var startY = index * chunks[0].height;
        context.putImageData(chunk, 0,  startY);
      }, this);
    },

    scale(imageData, imageWidth){
      // First figure out the number to scale by
      var scale = imageWidth / imageData.width;

      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      canvas.width = imageData.width * scale;
      canvas.height = imageData.height * scale;

      var newCanvas = document.createElement('canvas');
      this._writeImageData(newCanvas, imageData);

      // Scale 'er
      context.scale(scale, scale);
      context.drawImage(newCanvas, 0, 0);

      // Return the new sized image
      return context.getImageData(0, 0, canvas.width, canvas.height);
    },

    buildPalette(imageData, numColors){
      var rgbq = new RgbQuant({
        colors: numColors
      });

      // Make a new canvas, and resize it half size
      // to speed up palette building significantly
      var reducedImageData;
      if(this.fastquant){
        reducedImageData = this.scale(imageData, Math.floor(imageData.width / 2));
      }else{
        reducedImageData = imageData;
      }

      var startTime = performance.now();
      rgbq.sample(reducedImageData);
      console.log('Done sampling in ' + (performance.now() - startTime) + ' milliseconds!');
      startTime = performance.now();
      rgbq.palette(false, false);
      console.log('Done pallet building in ' + (performance.now() - startTime) + ' milliseconds!');
      return rgbq;
    },

    quantize(imageData, palette, numColors){
      var rgbq = new RgbQuant({
        colorDist: 'manhattan',
        colors: numColors,
        palette: palette
      });
      var quantImageData = new Uint8ClampedArray(rgbq.reduce(imageData));
      return new ImageData(quantImageData, imageData.width, imageData.height);
    },

    _readImageData(canvas){
      var context = canvas.getContext('2d');
      return context.getImageData(0,0,canvas.width, canvas.height);
    },

    _writeImageData(canvas, imageData){
      canvas.height = imageData.height;
      canvas.width = imageData.width;
      var context = canvas.getContext('2d');
      context.putImageData(imageData, 0, 0);
      return context;
    },

  };

  if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope){
    self.crossStitchBehavior = crossStitchBehavior;
  }else{
    window.crossStitchBehavior = crossStitchBehavior;
  }
})();
