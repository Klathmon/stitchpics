(function() {
  'use strict';
  var pixelateBehavior = {

    pixelate(imageData, fitObj) {

      this.isLittleEndian = this._isLittleEndian();

      var superPixelSize = [fitObj.pixelWidth, fitObj.pixelHeight];

      var xSuperPixels = fitObj.xPixels;
      var ySuperPixels = fitObj.yPixels;
      for (var superPixelX = 0; superPixelX < xSuperPixels; superPixelX++) {
        for (var superPixelY = 0; superPixelY < ySuperPixels; superPixelY++) {
          // First get the mode color of the super pixel
          var color = this._getMode(imageData, superPixelX, superPixelY, superPixelSize);

          // Now set the superPixel to that color entirely
          this._setSuperPixelColor(imageData, superPixelX, superPixelY, superPixelSize, color);
        }
      }
      return imageData;
    },

    _getMode(imageData, superPixelX, superPixelY, superPixelSize) {
      // I love ES6!
      var [uInt32Array, imageWidth, imageHeight] = this._convertImageDataToUint32Array(imageData);
      var [superPixelWidth, superPixelHeight] = superPixelSize;
      var isLittleEndian = this.isLittleEndian;

      var map = {};
      var mode = null;
      var largestCount = 1;

      // Loop over each "pixel" within this superPixel
      for (var subPixelX = 0; subPixelX < superPixelWidth; subPixelX++) {
        for (var subPixelY = 0; subPixelY < superPixelHeight; subPixelY++) {
          var xPos = (superPixelX * superPixelWidth) + subPixelX;
          var yPos = (superPixelY * superPixelHeight) + subPixelY;

          //Make sure we are within the image bounds
          if (xPos < imageWidth && yPos < imageHeight) {

            var pixel = uInt32Array[((yPos * imageWidth) + xPos) | 0];

            if (subPixelX === 0 && subPixelY === 0) {
              mode = pixel;
            }

            var thisCount = map[pixel];

            if (!thisCount) {
              thisCount = 1;
            } else {
              thisCount++;
            }

            if (thisCount > largestCount) {
              mode = pixel;
              largestCount = thisCount;
            }

            map[pixel] = thisCount;
          }
        }
      }

      if (mode === null) {
        return [0, 0, 0, 0];
      } else {
        return this._getPixelEndianSafe(isLittleEndian, mode);
      }
    },

    _setSuperPixelColor(imageData, superPixelX, superPixelY, superPixelSize, color) {
      // I love ES6!
      var [uInt32Array, imageWidth, imageHeight] = this._convertImageDataToUint32Array(imageData);
      var [superPixelWidth, superPixelHeight] = superPixelSize;
      var isLittleEndian = this.isLittleEndian;
      var [red, green, blue, alpha] = color;

      // Loop over each "pixel" within this superPixel
      for (var subPixelX = 0; subPixelX < superPixelWidth; subPixelX++) {
        for (var subPixelY = 0; subPixelY < superPixelHeight; subPixelY++) {
          var xPos = (superPixelX * superPixelWidth) + subPixelX;
          var yPos = (superPixelY * superPixelHeight) + subPixelY;

          //Make sure we are within the image bounds
          if (xPos < imageWidth && yPos < imageHeight) {
            var index = ((yPos * imageWidth) + xPos) | 0;

            if (subPixelX === superPixelWidth - 1 || subPixelY === superPixelHeight - 1) {
              // If it's the bottom or right side, draw the grid
              uInt32Array[index] = this._setPixelEndianSafe(isLittleEndian, 50, 50, 50, 255);
            } else if(alpha < 200){
              uInt32Array[index] = 0x00000000;
            }else{
              // Otherwise just fill it with the mode colors (set alpha to 255)
              uInt32Array[index] = this._setPixelEndianSafe(isLittleEndian, red, green, blue, 255);
            }
          }
        }
      }
    },

    _setPixelEndianSafe(isLittleEndian, red, green, blue, alpha) {
      if (isLittleEndian) {
        return (alpha << 24) | (blue << 16) | (green << 8) | red;
      } else {
        return (red << 24) | (green << 16) | (blue << 8) | alpha;
      }
    },

    _getPixelEndianSafe(isLittleEndian, pixel){
      if(isLittleEndian){
        return [(pixel & 0x000000ff), (pixel & 0x0000ff00) >>> 8, (pixel & 0x00ff0000) >>> 16, (pixel & 0xff000000) >>> 24];
      }else{
        return [(pixel & 0xff000000) >>> 24, (pixel & 0x00ff0000) >>> 16, (pixel & 0x0000ff00) >>> 8, (pixel & 0x000000ff)];
      }
    },

    _isLittleEndian() {
      var buf = new ArrayBuffer(12);
      var uInt32Array = new Uint32Array(buf);

      uInt32Array[1] = 0x0a0b0c0d;

      if (buf[4] === 0x0a && buf[5] === 0x0b && buf[6] === 0x0c && buf[7] === 0x0d) {
        return false;
      } else {
        return true;
      }
    },





    _convertImageDataToUint32Array(imageData) {
      return [
        new Uint32Array(imageData.data.buffer),
        imageData.width,
        imageData.height
      ];
    },
  };

  if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
    self.pixelateBehavior = pixelateBehavior;
  } else {
    window.pixelateBehavior = pixelateBehavior;
  }
})();
