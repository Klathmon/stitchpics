class Pixelate {

  constructor(imageData, spWidth, spHeight, numSpx, numSpy, hideTheGrid){
    // Check endianess
    this._isLittleEndian = this._checkIsLittleEndian();

    // Dump params to this
    this._spWidth = spWidth;
    this._spHeight = spHeight;
    this._numSpx = numSpx;
    this._numSpy = numSpy;
    this._hideTheGrid = hideTheGrid;

    // Dump imageData into it's parts
    this._imageData = imageData;
    this._imageWidth = imageData.width;
    this._imageHeight = imageData.height;

    // Create a uint32 view of the imageData buffer
    this._uInt32Array = new Uint32Array(this._imageData.data.buffer);

    // Cache the packed grid pixel color for speed
    this._gridPixelColorPacked = this._packPixel(50, 50, 50, 255);
  }

  /**
   * Runs the pixelate algorithm to actually convert the image into the pattern
   * @return {Promise} resolve(pixelatedImageData)
   */
  pixelate(){
    return new Promise((resolve, reject)=>{
      for(let spx = 0; spx < this._numSpx; spx++){
        for(let spy = 0; spy < this._numSpy; spy++){
          let color = this._getSuperPixelColor(spx, spy);
          this._setSuperPixelColor(spx, spy, color);
        }
      }

      //TODO: resolve this right...
      resolve(this._imageData);
    });
  }



  _setSuperPixelColor(spx, spy, color){
    let [red, green, blue, alpha] = color;

    for(let pixelX = 0; pixelX < this._spWidth; pixelX++){
      for(let pixelY = 0; pixelY < this._spHeight; pixelY++){
        let [xPos, yPos] = this._getPixelPos(spx, spy, pixelX, pixelY);

        // Ignore anything outside of the image bounds
        if(xPos < this._imageWidth && yPos < this._imageHeight){
          let index = ((yPos * this._imageWidth) + xPos) | 0;

          if(
            !this._hideTheGrid &&
            (pixelX === this._spWidth - 1 || pixelY === this._spHeight - 1)
          ){
            // This pixel is on the bottom or right side of the super pixel,
            // so draw the grid (if its enabled)
            this._uInt32Array[index] = this._gridPixelColorPacked;
          }else if (alpha < 200){
            // This pixel is mostly alpha, so just convert it to complete alpha
            uInt32Array[index] = 0x00000000;
          }else{
            // This is a normal pixel, so pack the given color and set the pixel to that
            uInt32Array[index] = this._packPixel(red, green, blue, 255);
          }
        }

      }
    }

  }

  _getSuperPixelColor(spx, spy){
    let map = new Map();
    let mode = null;
    let largestCount = 1;

    for(let pixelX = 0; pixelX < this._spWidth; pixelX++){
      for(let pixelY = 0; pixelY < this._spHeight; pixelY++){
        let [xPos, yPos] = this._getPixelPos(spx, spy, pixelX, pixelY);

        // Ignore anything outside of the image bounds
        if(xPos < this._imageWidth && yPos < this._imageHeight){
          let pixelModeNumber = 1;

          // Get the actual pixel value
          let pixel = uIn32Array[((yPos * this._imageWidth) + xPos) | 0];

          // If this is the first pixel, then it's the mode to start with!
          if(pixelX === 0 && pixelY === 0){
            mode = pixel;
          }

          if(map.has(pixel)){
            pixelModeNumber = map.get(pixel) + 1;
          }

          map.set(pixel, pixelModeNumber);

          if(pixelModeNumber > largestCount){
            mode = pixel;
            largestCount = pixelModeNumber;
          }
        }
      }
    }

    if(mode === null){
      return [0, 0, 0, 0];
    }else{
      return this._unpackPixel(mode);
    }
  }

  /**
   * Gets the global postion of an individual pixel from the x/y super pixel and sub-pixel x/y
   *
   * @param  {int} spx    Super Pixel X Pos
   * @param  {int} spy    Super Pixel Y Pos
   * @param  {int} pixelX Sub Pixel X Pos
   * @param  {int} pixelY Sub Pixel X Pos
   * @return {Array}      [xPos, yPos] position of the individual pixel
   */
  _getPixelPos(spx, spy, pixelX, pixelY){
    let xPos = (spx * this._spWidth) + pixelX;
    let yPos = (spy * this._spHeight) + pixelY;

    return [xPos, yPos];
  }

  /**
   * Packs an RGBA value to a 32bit int.
   * This function is either-endian safe
   *
   * Note: Bounds are not checked for any of the values!
   *
   * @param  {int}  red     0-255
   * @param  {int}  green   0-255
   * @param  {int}  blue    0-255
   * @param  {int}  alpha   0-255
   * @return {int}          uint32 packed pixel color
   */
  _packPixel(red, green, blue, alpha) {
    if (this._isLittleEndian) {
      return (alpha << 24) | (blue << 16) | (green << 8) | red;
    } else {
      return (red << 24) | (green << 16) | (blue << 8) | alpha;
    }
  }

  /**
   * Packs an RGBA value to a 32bit int.
   * This function is either-endian safe
   *
   * Note: Bounds are not checked for any of the values!
   *
   * @param  {int}   packedPixel uint32 packed pixel color value
   * @return {array}             [red,green,blue,alpha] array of 0-255 each
   */
  _unpackPixel(packedPixel){
    if (this._isLittleEndian) {
      return [
        (packedPixel & 0x000000ff),
        (packedPixel & 0x0000ff00) >>> 8,
        (packedPixel & 0x00ff0000) >>> 16,
        (packedPixel & 0xff000000) >>> 24
      ];
    } else {
      return [
        (packedPixel & 0xff000000) >>> 24,
        (packedPixel & 0x00ff0000) >>> 16,
        (packedPixel & 0x0000ff00) >>> 8,
        (packedPixel & 0x000000ff)
      ];
    }
  }

  /**
   * Checks if the system is little or big endian
   * @return {Boolean} True if little endian, false if big endian
   */
  _checkIsLittleEndian() {
    let buffer = new ArrayBuffer(12);
    let uInt32Array = new Uint32Array(buffer);

    uInt32Array[1] = 0x0a0b0c0d;

    if (buffer[4] === 0x0a && buffer[5] === 0x0b && buffer[6] === 0x0c && buffer[7] === 0x0d) {
      return false;
    } else {
      return true;
    }
  }
}
