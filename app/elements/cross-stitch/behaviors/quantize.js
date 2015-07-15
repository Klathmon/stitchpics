(function() {
  'use strict';
  var behavior = {

    /**
     * Builds the palette from the imageData
     * @param  {object}   imageData the image data to scale
     * @param  {int}      numColors the number of output colors wanted
     * @return {Promise}            resolve({imageData, palette}, [transferrable])
     */
    buildPalette({imageData, numColors}) {
      return new Promise((resolve, reject)=>{
        var rgbq = new RgbQuant({colors: numColors});
        rgbq.sample(imageData);
        var palette = rgbq.palette(true);

        resolve({imageData, palette}, [imageData.data.buffer]);
      });
    },

    /**
     * actually quantizes the image data to reduce the colors down to the number given
     * @param  {object}  imageData the image data to quantize
     * @param  {array}   palette   the palette array returned from buildPalette()
     * @param  {int}     numColors the number of output colors wanted
     * @param  {int}     index     the index of the chunk (so it can be peaced back together in the right order)
     * @return {Promise}           resolve({imageData, index}, [transferrable])
     */
    quantize({imageData, palette, numColors, index}) {
      return new Promise((resolve, reject)=>{

        var opts = {
          colorDist: 'manhattan',
          colors: numColors,
          palette
        };

        var rgbq = new RgbQuant(opts);

        var returnImageData = {
          data: new Uint8ClampedArray(rgbq.reduce(imageData, 1)),
          width: imageData.width,
          height: imageData.height
        };

        resolve({imageData: returnImageData, index}, [imageData.data.buffer]);
      });
    }

  };

  self.quantizeBehavior = behavior;
})();
