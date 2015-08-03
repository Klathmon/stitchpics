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
        const opts = {
          colors: numColors,
          colorDist: 'euclidean',
          method: 1,
          initColors: this._getDmcColorMap().size,
          useCache: false,
          palette: this._getColorsAsRGB(),
          reIndex: true
        }
        let rgbq = new RgbQuant(opts);
        rgbq.sample(imageData);
        let palette = rgbq.palette(true);

        resolve({imageData, palette}, [imageData.data.buffer]);
      });
    },

    /**
     * actually quantizes the image data to reduce the colors down to the number given
     * @param  {object}  imageData the image data to quantize
     * @param  {array}   palette   the palette array returned from buildPalette()
     * @return {Promise}           resolve({imageData, index}, [transferrable])
     */
    quantize({imageData, palette}) {
      return new Promise((resolve, reject)=>{

        const opts = {
          colorDist: 'euclidean',
          method: 1,
          initColors: 2048,
          useCache: false,
          palette
        };

        let rgbq = new RgbQuant(opts);

        let returnImageData = {
          data: new Uint8ClampedArray(rgbq.reduce(imageData, 1)),
          width: imageData.width,
          height: imageData.height
        };

        resolve({imageData: returnImageData}, [imageData.data.buffer]);
      });
    }

  };

  self.quantizeBehavior = behavior;
})();
