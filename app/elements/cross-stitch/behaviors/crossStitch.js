(function() {
  'use strict';
  var crossStitchBehavior = {

    fit: function(imageData, xPixels){
      var scale = xPixels / imageData.width;
      var yPixels = Math.floor(imageData.height * scale);

      return {
        xPixels: xPixels,
        yPixels: yPixels,
        pixelWidth: Math.ceil(imageData.width / xPixels),
        pixelHeight: Math.ceil(imageData.height / yPixels)
      };
    },

    split: function(imageData, numberOfParts, fitObj){
      var chunks = [];
      var imageWidth = imageData.width;
      var imageHeight = imageData.height;

      var chunkHeightExact = Math.floor(imageHeight / numberOfParts);
      var numberOfPixelsHigh = Math.ceil(chunkHeightExact / fitObj.pixelHeight);
      var chunkHeight = numberOfPixelsHigh * fitObj.pixelHeight;

      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      this._writeImageData(canvas, imageData);

      for(var chunk = 0; chunk < numberOfParts; chunk++){
        var startY = chunk * chunkHeight;

        // If this is the last chunk, add the remainder of pixels that didn't
        // divide evently on to it.
        if(chunk === numberOfParts-1){
          chunkHeight = imageHeight - (chunkHeight * chunk);
        }
        // Push the chunk to the array of chunks
        chunks.push(context.getImageData(0, startY, imageWidth, chunkHeight));
      }

      return chunks;
    },

    stitch: function(chunks, canvas){
      var imageWidth = chunks[0].width;
      var imageHeight = chunks.reduce(function(runningTotal, chunk){
        return runningTotal + chunk.height;
      }, 0);

      canvas.width = imageWidth;
      canvas.height = imageHeight;

      var context = canvas.getContext('2d');

      chunks.forEach(function(chunk, index){
        // Use the first chunk's height as the multiplier.
        // As the last one is different, so it will be offset by the difference
        var startY = index * chunks[0].height;
        context.putImageData(chunk, 0,  startY);
      }, this);
    },

    scale: function(imageData, imageWidth){
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

    buildPalette: function(imageData, numColors){
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


      rgbq.sample(reducedImageData);
      rgbq.palette(false, false);
      return rgbq;
    },

    quantize: function(imageData, palette, numColors){
      var rgbq = new RgbQuant({
        colorDist: 'manhattan',
        colors: numColors,
        palette: palette
      });
      var quantImageData = new Uint8ClampedArray(rgbq.reduce(imageData));
      return new ImageData(quantImageData, imageData.width, imageData.height);
    },

    pixelate: function(imageData, fitObj){
      // calculate the 'pixel' width and height
      var xPixels = fitObj.xPixels;
      var yPixels = fitObj.yPixels;
      var pixelWidth = fitObj.pixelWidth;
      var pixelHeight = fitObj.pixelHeight;
      var imageWidth = imageData.width;
      var imageHeight = imageData.height;

      // Loop over each (super)pixel (x and y)
      for(var pixelXNum = 0; pixelXNum < xPixels; pixelXNum++){
        for(var pixelYNum = 0; pixelYNum < yPixels; pixelYNum++){

          var colorModeObj = {
              map: {},
              mode: null,
              modeCount: 1
            };

          for(var loopNum = 1; loopNum <= 2; loopNum++){
            var mode = [];

            if(loopNum !== 1 && colorModeObj.mode !== null){
              mode = colorModeObj.mode.split('.');
            }

            // Loop over each "pixel" within a pixelated-pixel
            for(var subPixelXNum = 0; subPixelXNum < pixelWidth; subPixelXNum++){
              for(var subPixelYNum = 0; subPixelYNum < pixelHeight; subPixelYNum++){
                var first=false;

                if(subPixelXNum === 0 && subPixelYNum === 0){
                  first = true;
                }
                var xPos = (pixelXNum * pixelWidth) + subPixelXNum;
                var yPos = (pixelYNum * pixelHeight) + subPixelYNum;
                var arrayIndexNumber = (yPos * imageWidth * 4) + (xPos * 4);

                if(xPos < imageWidth && yPos < imageHeight){
                  if(loopNum === 1){
                    this._getMode(colorModeObj, imageData.data, arrayIndexNumber, first);
                  }else{
                    if(subPixelXNum === pixelWidth-1 || subPixelYNum === pixelHeight-1) {
                      // If it's the bottom or right side, draw the grid
                      imageData.data[arrayIndexNumber] = 50;   //R
                      imageData.data[arrayIndexNumber+1] = 50; //G
                      imageData.data[arrayIndexNumber+2] = 50; //B
                      imageData.data[arrayIndexNumber+3] = 255; //Clear out any alpha channel
                    }else{
                      // otherwise draw the entire pixel the mode's color

                      if(mode[3] < 128){
                        imageData.data[arrayIndexNumber] = 0;   //R
                        imageData.data[arrayIndexNumber+1] = 0; //G
                        imageData.data[arrayIndexNumber+2] = 0; //B
                        imageData.data[arrayIndexNumber+3] = 0; //Clear out any alpha channel
                      }else{
                        imageData.data[arrayIndexNumber] = mode[0];   //R
                        imageData.data[arrayIndexNumber+1] = mode[1]; //G
                        imageData.data[arrayIndexNumber+2] = mode[2]; //B
                        imageData.data[arrayIndexNumber+3] = 255; //Clear out any alpha channel
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      return imageData;
    },

    _getMode: function(modeObj, data, index, first){
      var key = '';
      key += data[index] + '.';
      key += data[index+1] + '.';
      key += data[index+2] + '.';
      key += data[index+3];

      if(first === true){
        modeObj.mode = key;
      }

      if(!modeObj.map[key]){
        modeObj.map[key] = 1;
      }else{
        modeObj.map[key]++;
      }

      if(modeObj.map[key] > modeObj.maxCount)
      {
        modeObj.mode = key;
        modeObj.modeCount = modeObj.map[key];
      }
    },

    _readImageData: function(canvas){
      var context = canvas.getContext('2d');
      return context.getImageData(0,0,canvas.width, canvas.height);
    },

    _writeImageData: function(canvas, imageData){
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
