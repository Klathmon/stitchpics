class Quantizor {

  /**
   * Creates the object
   *
   * @param  {ImageData} imageData    Can be "real" or "created" in the sense that it
   *                                  simply follows the real ImageData interface.
   * @param  {Bool} useDmcColors      True if they should be used, false or undefined otherwise
   * @param  {Bool} highQualityMode   True if high quality mode, false or undefined otherwise
   */
  constructor(imageData, useDmcColors = false, highQualityMode = false){
    this._useDmcColors = useDmcColors;
    this._imageData = imageData;
    this._highQualityMode = highQualityMode;
    this._dmcColorsObj = new Colorizor();
  }

  /**
   * Builds and returns the palette of colors in the image
   *
   * @param  {int} numColors Number of colors to try and reduce the palette to
   * @return {Promise}       resolve(palette) palette is an array of [r,g,b] tuples
   */
  buildPalette(numColors){
    let rgbq = new RgbQuant(this._buildOpts({numColors}));
    rgbq.sample(this._imageData);
    let palette = rgbq.palette(true);

    return palette;
  }

  /**
   * Actually quantizes the image to reduce it's colors to only the palette colors
   *
   * @param  {Array} palette An array of [r,g,b] tuples of 0-255 each for each color
   * @return {Promise}       resolve(quantizedImageData) the quantized image data (in "fake"
   *                         imageData form in that it just follows the real ImageData interface)
   */
  quantize(palette){
    let rgbq = new RgbQuant(this._buildOpts({palette}));
    let quantizedUint8Array = rgbq.reduce(this._imageData, 1);

    let returnImageData = {
      data: new Uint8ClampedArray(quantizedUint8Array),
      width: this._imageData.width,
      height: this._imageData.height
    };

    return returnImageData;
  }

  /**
   * creates the options object to be passed to RgbQuant.js
   * @param  {[int]} numColors     [the number of colors to use (optional)]
   * @param  {[array]} palette     [the palette to be used (optional)]
   * @return {[Object]}            [the hash to put into RgbQuant.js]
   */
  _buildOpts({numColors, palette}){
    let opts = {
      colorDist: 'euclidean',
      useCache: false,
      colors: numColors,
      reIndex: true,
      palette: this._getPalette(palette)
    };

    if(this._highQualityMode){
      opts.method = 2;
      opts.boxSize = [32,32];
      opts.boxPxls = 2;
      opts.minHueCols = 512;
      opts.dithKern = 'FloydSteinberg';
      opts.dithDelt = 0.1;
    }else{
      opts.method = 1;
      opts.initColors = this._getInitColors();
    }

    return opts;
  }

  /**
   * gets the number of init colors depending on if DMC colors are used
   *
   * @return {int} either 2048 or the number of DMC colors available
   */
  _getInitColors(){
    if(this._useDmcColors){
      return this._dmcColorsObj.getDmcColorMap().size;
    }else{
      return 2048;
    }
  }

  /**
   * returns the palette
   * @param  {[array]} palette [the palette if applicable]
   * @return {[multiple]}         [the palette to pass into the RgbQuant.js object]
   */
  _getPalette(palette = false){
    if(palette !== false){
      return palette;
    }else if(this._useDmcColors){
      return this._dmcColorsObj.getColorsAsRGB();
    }else{
      return undefined;
    }
  }
}
