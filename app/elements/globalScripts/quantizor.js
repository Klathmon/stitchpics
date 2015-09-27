class Quantizor {

  /**
   * Creates the object
   *
   * @param  {ImageData} imageData    Can be "real" or "created" in the sense that it
   *                                  simply follows the real ImageData interface.
   * @param  {Bool} useDmcColors      True if they should be used, false or undefined otherwise
   */
  constructor(imageData, useDmcColors = false){
    this._useDmcColors = useDmcColors;
    this._imageData = imageData;
    this._dmcColorsObj = new Colorizor();
  }

  /**
   * Builds and returns the palette of colors in the image
   *
   * @param  {int} numColors Number of colors to try and reduce the palette to
   * @return {Promise}       resolve(palette) palette is an array of [r,g,b] tuples
   */
  buildPalette(numColors){
    console.log('buildPalette proper is running!');
    let opts = {
      colorDist: 'euclidean',
      method: 1,
      useCache: false,
      initColors: this._getInitColors(),
      colors: numColors,
      palette: (this._useDmcColors ?
        this._dmcColorsObj.getColorsAsRGB() :
        undefined),
      reIndex: true
    };

    let rgbq = new RgbQuant(opts);
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
    let opts = {
      colorDist: 'euclidean',
      method: 1,
      useCache: false,
      initColors: this._getInitColors(),
      palette
    };

    let rgbq = new RgbQuant(opts);
    let quantizedUint8Array = rgbq.reduce(this._imageData, 1);

    let returnImageData = {
      data: new Uint8ClampedArray(quantizedUint8Array),
      width: this._imageData.width,
      height: this._imageData.height
    };

    return returnImageData;
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
}
