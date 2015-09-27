(function () {
  'use strict';
  var behavior = {

    scaleImage(imageData, newWidth){
      return new Promise((resolve, reject)=>{
        let sizor = new Sizor();
        sizor.scale(imageData, newWidth).then(resolve);
      });
    },

    buildPalette(imageData, numColors, useDmcColors){
      return this.workor.dispatchWorker(function(imageData, numColors, useDmcColors){
        // Inside the worker now, don't have any closed over variables...
        let quantizor = new Quantizor(imageData, useDmcColors);
        let palette = quantizor.buildPalette(numColors);

        return [[imageData, palette], [imageData.data.buffer]];
      }, [imageData, numColors, useDmcColors], [imageData.data.buffer]);
    },

    quantize(imageData, palette, useDmcColors){
      return this.workor.dispatchWorker(function(imageData, palette, useDmcColors){
        // Inside the worker now, don't have any closed over variables...
        let quantizor = new Quantizor(imageData, useDmcColors);
        let newImageData = quantizor.quantize(palette);
        return [newImageData, [newImageData.data.buffer]];

      }, [imageData, palette, useDmcColors], [imageData.data.buffer]);
    },

    pixelate(imageData, spWidth, spHeight, numSpx, numSpy, hideTheGrid){
      return this.workor.dispatchWorker(function(imageData, spWidth, spHeight, numSpx, numSpy, hideTheGrid){
        // Inside the worker now, don't have any closed over variables...
        let pixelator = new Pixelator(imageData, spWidth, spHeight, numSpx, numSpy, hideTheGrid);
        let pixelatedImageData = pixelator.run();
        return [pixelatedImageData, [pixelatedImageData.data.buffer]];
      }, [imageData, spWidth, spHeight, numSpx, numSpy, hideTheGrid], [imageData.data.buffer]);
    }

  };

  self.processingFunctions = behavior;
})();
