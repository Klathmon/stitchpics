class Quantizor {

  constructor(imageData, useDmcColors = false){
    this._useDmcColors = useDmcColors;
    this._imageData = imageData;
    this._dmcColorsObj = new DmcColors();
  }

  buildPalette(numColors){
    return new Promise((resolve, reject)=>{
      let opts = {
        colorDist: 'euclidean',
        method: 1,
        useCache: false,
        initColors: (this._useDmcColors ?
          this._dmcColorsObj.getDmcColorMap().size :
          2048),
        colors: numColors,
        palette: (this._useDmcColors ?
          this._dmcColorsObj.getColorsAsRGB() :
          undefined),
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
        useCache: false,
        initColors: (this._useDmcColors ?
          this._dmcColorsObj.getDmcColorMap().size :
          2048),
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
