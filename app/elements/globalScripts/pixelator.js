class Pixelator {

  /**
   * Creates the object
   * @param  {ImageData} imageData   an ImageData object. Can be "real" or "fabricated" (meaning it
   *                                 simply matches the interface of ImageData)
   * @param  {int} spWidth           Super Pixel Width
   * @param  {int} spHeight          Super Pixel Height
   * @param  {int} numSpx            Number of Super Pixels on the X axis
   * @param  {int} numSpy            Number of Super Pixels on the Y axis
   * @param  {bool} hideTheGrid      true hides the "grid" overlay, false (or unset) shows it.
   */
  constructor(imageData, chunkStartY, spWidth, spHeight, numSpx, numSpy, hideTheGrid = false){
    this._bitPacker = new BitPacker();

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
    this._gridPixelColorPacked = this._bitPacker.packPixel(50, 50, 50, 255);
    this._gridPixelColorPackedMod10 = this._bitPacker.packPixel(255, 255, 255, 255);

    // This is the number of spy's that came before this chunk (for the grid every x pixels code)
    this._prevSpy = (chunkStartY / this._spHeight) | 0;
  }

  /**
   * Runs the Pixelator algorithm to actually convert the image into a pattern
   *
   * @return {Promise} resolve(pixelatedImageData)
   */
  run(){
    for(let spx = 0; spx < this._numSpx; spx++){
      for(let spy = 0; spy < this._numSpy; spy++){
        let color = this._getSuperPixelColor(spx, spy);
        this._setSuperPixelColor(spx, spy, color);
      }
    }
    return this._imageData;
  }



  /**
   * Gets the super pixels' "overall" color.
   * Currently this works by just taking the mode of the entire super-pixel and returning that
   *
   * @param  {int} spx    Super Pixel X Pos
   * @param  {int} spy    Super Pixel Y Pos
   * @return {Array}      [red, green, blue, alpha] pixel color
   */
  _getSuperPixelColor(spx, spy){
    let map = {};
    let mode = null;
    let largestCount = 1;

    for(let pixelX = 0; pixelX < this._spWidth; pixelX++){
      for(let pixelY = 0; pixelY < this._spHeight; pixelY++){
        let [xPos, yPos] = this._getPixelPos(spx, spy, pixelX, pixelY);

        // Ignore anything outside of the image bounds
        if(xPos < this._imageWidth && yPos < this._imageHeight){
          let pixelModeNumber = 1;

          // Get the actual pixel value
          let pixel = this._uInt32Array[(yPos * this._imageWidth) + xPos];

          // If this is the first pixel, then it's the mode to start with!
          if(pixelX === 0 && pixelY === 0){
            mode = pixel;
          }

          if(pixel in map){
            pixelModeNumber = map[pixel] + 1;
          }

          map[pixel] = pixelModeNumber;

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
      return this._bitPacker.unpackPixel(mode);
    }
  }


  /**
   * Gets the super pixels' "overall" color.
   * This is a "fast" version which just uses the center of each "super pixel" as the main color
   *
   * @param  {int} spx    Super Pixel X Pos
   * @param  {int} spy    Super Pixel Y Pos
   * @return {Array}      [red, green, blue, alpha] pixel color
   */
  _fastGetSuperPixelColor(spx, spy){
    let [xPos, yPos] = this._getPixelPos(spx, spy, (this._spWidth / 2) | 0, (this._spHeight / 2) | 0);

    let pixel = this._uInt32Array[(yPos * this._imageWidth) + xPos];

    return this._bitPacker.unpackPixel(pixel);
  }

  /**
   * Sets the given super pixel to the given color
   *
   * @param  {int} spx    Super Pixel X Pos
   * @param  {int} spy    Super Pixel Y Pos
   */
  _setSuperPixelColor(spx, spy, color){
    let [red, green, blue, alpha] = color;

    for(let pixelX = 0; pixelX < this._spWidth; pixelX++){
      for(let pixelY = 0; pixelY < this._spHeight; pixelY++){
        let [xPos, yPos] = this._getPixelPos(spx, spy, pixelX, pixelY);

        // Ignore anything outside of the image bounds
        if(xPos < this._imageWidth && yPos < this._imageHeight){
          let index = ((yPos * this._imageWidth) + xPos) | 0;


          // if this pixel is mostly alpha, then just convert it to complete alpha = 0x00000000
          // otherwise set the pixel color
          this._uInt32Array[index] = (alpha < 200 ? 0x00000000 : this._bitPacker.packPixel(red, green, blue, 255));

          if(!this._hideTheGrid){
            if(pixelX === this._spWidth - 1){
              this._uInt32Array[index] = this._gridPixelColorPacked;
              if((spx + 1) % 10 === 0){
                this._uInt32Array[index] = this._gridPixelColorPackedMod10;
              }
            }else if(pixelY === this._spHeight - 1){
              this._uInt32Array[index] = this._gridPixelColorPacked;
              if((this._prevSpy + spy + 1) % 10 === 0){
                this._uInt32Array[index] = this._gridPixelColorPackedMod10;
              }
            }
          }
        }
      }
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
}
