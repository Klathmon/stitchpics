class Quantizor {

  constructor(imageData, useDmcColors = false){
    this._useDmcColors = useDmcColors;
    this._imageData = imageData;
  }

  buildPalette(numColors){
    return new Promise((resolve, reject)=>{
      let opts = {
        colors: numColors,
        colorDist: 'euclidean',
        method: 1,
        initColors: (this._useDmcColors ? this._getDmcColorMap().size : 2048),
        useCache: false,
        palette: (this._useDmcColors ? this._getColorsAsRGB() : undefined),
        reIndex: true
      };

      let rgbq = new RgbQuant(opts);
      rgbq.sample(this._imageData.data, this._imageData.width);
      let palette = rgbq.palette(true);

      resolve(palette);
    });
  }

  quantize(palette){
    return new Promise((resolve, reject)=>{
      let opts = {
        colorDist: 'euclidean',
        method: 1,
        initColors: (this._useDmcColors ? this._getDmcColorMap().size : 2048),
        useCache: false,
        palette
      };

      let rgbq = new RgbQuant(opts);
      let quantizedUint8Array = rgbq.reduce(this._imageData, 1);

      let returnImageData = {
        data: new Uint8ClampedArray(quantizedUint8Array),
        width: this._imageData.width,
        height: this._imageData.height
      };

      resolve(returnImageData);
    });
  }
}
