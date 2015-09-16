(function() {
  'use strict';
  var behavior = {


    pixelate({imageData, pixelWidth, pixelHeight, xPixels, yPixels, hideTheGrid}) {
      return new Promise((resolve, reject)=>{
        let pixelator = new Pixelator(imageData, pixelWidth, pixelHeight, xPixels, yPixels, hideTheGrid);
        pixelator.run().then((imageData)=>{
          resolve(this.encodeResolve({imageData}, [imageData.data.buffer]));
        });
      });
    },


    oldpixelate({imageData, pixelWidth, pixelHeight, xPixels, yPixels, hideTheGrid}) {
      this.isLittleEndian = this._isLittleEndian();

      for (var pixelX = 0; pixelX < xPixels; pixelX++) {
        for (var pixelY = 0; pixelY < yPixels; pixelY++) {
          // First get the mode color of the super pixel
          var color = this._getMode({imageData, pixelX, pixelY, pixelWidth, pixelHeight, xPixels, yPixels});

          // Now set the superPixel to that color entirely
          this._setSuperPixelColor({imageData, pixelX, pixelY, pixelWidth, pixelHeight, xPixels, yPixels, color, hideTheGrid});
        }
      }
      return Promise.resolve(this.encodeResolve({imageData}, [imageData.data.buffer]));
    },

    _getMode({imageData, pixelX, pixelY, pixelWidth, pixelHeight, xPixels, yPixels}) {
      var {data: imageDataData, width: imageWidth, height: imageHeight} = imageData;
      var uInt32Array = new Uint32Array(imageDataData.buffer);
      // Locality bro!
      var isLittleEndian = this.isLittleEndian;

      var map = new Map();
      var mode = null;
      var largestCount = 1;

      // Loop over each "pixel" within this superPixel
      for (var subPixelX = 0; subPixelX < pixelWidth; subPixelX++) {
        for (var subPixelY = 0; subPixelY < pixelHeight; subPixelY++) {
          var xPos = (pixelX * pixelWidth) + subPixelX;
          var yPos = (pixelY * pixelHeight) + subPixelY;

          //Make sure we are within the image bounds
          if (xPos < imageWidth && yPos < imageHeight) {

            var pixel = uInt32Array[((yPos * imageWidth) + xPos) | 0];

            if (subPixelX === 0 && subPixelY === 0) {
              // If this is the first pixel, then it's the mode to start with!
              mode = pixel;
            }

            if (!map.has(pixel)){
              map.set(pixel, 1);
            }else{
              map.set(pixel, map.get(pixel) + 1);
            }

            if (map.get(pixel) > largestCount) {
              mode = pixel;
              largestCount =  map.get(pixel);
            }
          }
        }
      }

      if (mode === null) {
        return [0, 0, 0, 0];
      } else {
        return this._getPixelEndianSafe(isLittleEndian, mode);
      }
    },

    _setSuperPixelColor({imageData, pixelX, pixelY, pixelWidth, pixelHeight, xPixels, yPixels, color, hideTheGrid}) {
      var {data: imageDataData, width: imageWidth, height: imageHeight} = imageData;
      var uInt32Array = new Uint32Array(imageDataData.buffer);
      // Locality bro!
      var isLittleEndian = this.isLittleEndian;
      var [red, green, blue, alpha] = color;

      // Loop over each "pixel" within this superPixel
      for (var subPixelX = 0; subPixelX < pixelWidth; subPixelX++) {
        for (var subPixelY = 0; subPixelY < pixelHeight; subPixelY++) {
          var xPos = (pixelX * pixelWidth) + subPixelX;
          var yPos = (pixelY * pixelHeight) + subPixelY;

          //Make sure we are within the image bounds
          if (xPos < imageWidth && yPos < imageHeight) {
            var index = ((yPos * imageWidth) + xPos) | 0;

            if (!hideTheGrid && (subPixelX === pixelWidth - 1 || subPixelY === pixelHeight - 1)) {
              // If it's the bottom or right side, draw the grid
              uInt32Array[index] = this._setPixelEndianSafe(isLittleEndian, 50, 50, 50, 255);
            } else if (alpha < 200) {
              uInt32Array[index] = 0x00000000;
            } else {
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

    _getPixelEndianSafe(isLittleEndian, pixel) {
      if (isLittleEndian) {
        return [(pixel & 0x000000ff), (pixel & 0x0000ff00) >>> 8, (pixel & 0x00ff0000) >>> 16, (pixel & 0xff000000) >>> 24];
      } else {
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
    }

  };

  self.pixelateBehavior = behavior;
})();
