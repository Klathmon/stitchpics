(function() {
  'use strict';
  var pixelateBehavior = {

    pixelate: function(imageData, fitObj) {
      var imageDataData = imageData.data;
      var imageWidth = imageData.width;
      var imageHeight = imageData.height;
      var superPixelsWide = fitObj.xPixels;
      var superPixelsHigh = fitObj.yPixels;
      var superPixelWidth = fitObj.pixelWidth;
      var superPixelHeight = fitObj.pixelHeight;

      this.isLittleEndian = this._isLittleEndian();

      for (var superPixelXNum = 0; superPixelXNum < superPixelsWide; superPixelXNum++) {
        for (var superPixelYNum = 0; superPixelYNum < superPixelsHigh; superPixelYNum++) {
          // First get the mode color of the super pixel
          var color = this._getMode(
            imageDataData,
            imageWidth,
            imageHeight,
            superPixelXNum,
            superPixelYNum,
            superPixelWidth,
            superPixelHeight);

          // Now set the superPixel to that color entirely
          this._setSuperPixelColor(
            imageData,
            superPixelXNum,
            superPixelYNum,
            superPixelWidth,
            superPixelHeight,
            color);
        }
      }

      return new ImageData(
        new Uint8ClampedArray(imageDataData),
        imageWidth,
        imageHeight
      );
    },

    _setSuperPixelColor: function(imageData, superPixelXNum, superPixelYNum, superPixelWidth, superPixelHeight, color) {
      var imageDataData = imageData.data;
      var imageWidth = imageData.width;
      var imageHeight = imageData.height;
      var uInt32Array = new Uint32Array(imageData.data.buffer);
      var isLittleEndian = this.isLittleEndian;

      var red = color[0];
      var green = color[1];
      var blue = color[2];

      // Loop over each "pixel" within this superPixel
      for (var subPixelXNum = 0; subPixelXNum < superPixelWidth; subPixelXNum++) {
        for (var subPixelYNum = 0; subPixelYNum < superPixelHeight; subPixelYNum++) {
          var index = this._getArrayIndexNumber(
            true,
            imageWidth,
            imageHeight,
            superPixelXNum,
            superPixelYNum,
            superPixelWidth,
            superPixelHeight,
            subPixelXNum,
            subPixelYNum);

          if (index !== -1) {
            if (subPixelXNum === superPixelWidth - 1 || subPixelYNum === superPixelHeight - 1) {
              // If it's the bottom or right side, draw the grid
              uInt32Array[index] = this._setPixelEndianSafe(isLittleEndian, 50, 50, 50, 255);
            } else {
              // Otherwise just fill it with the mode colors
              uInt32Array[index] = this._setPixelEndianSafe(isLittleEndian, red, green, blue, 255);
            }
          }
        }
      }
    },

    _getMode: function(imageDataData, imageWidth, imageHeight, superPixelXNum, superPixelYNum, superPixelWidth, superPixelHeight) {

      var map = {};
      var mode = null;
      var modeCount = 1;
      var first = true;

      // Loop over each "pixel" within this superPixel
      for (var subPixelXNum = 0; subPixelXNum < superPixelWidth; subPixelXNum++) {
        for (var subPixelYNum = 0; subPixelYNum < superPixelHeight; subPixelYNum++) {
          var index = this._getArrayIndexNumber(
            false,
            imageWidth,
            imageHeight,
            superPixelXNum,
            superPixelYNum,
            superPixelWidth,
            superPixelHeight,
            subPixelXNum,
            subPixelYNum);

          if (index !== -1) {
            var key = '' +
              imageDataData[index] + '.' +
              imageDataData[index + 1] + '.' +
              imageDataData[index + 2] + '.' +
              imageDataData[index + 3];

            if (subPixelXNum === 0 && subPixelYNum === 0) {
              mode = key;
            }

            if (!map[key]) {
              map[key] = 1;
            } else {
              map[key]++;
            }

            if (map[key] > modeCount) {
              mode = key;
              modeCount = map[key];
            }
          }
        }
      }

      if(mode != null){
        return mode.split('.')
      }else{
        return ['0', '0', '0', '0'];
      }
    },

    _getArrayIndexNumber: function(isUint32Array, imageWidth, imageHeight, superPixelXNum, superPixelYNum, superPixelWidth, superPixelHeight, subPixelXNum, subPixelYNum) {
      var xPos = (superPixelXNum * superPixelWidth) + subPixelXNum;
      var yPos = (superPixelYNum * superPixelHeight) + subPixelYNum;
      var multiplier = 4;

      if (isUint32Array) multiplier = 1;

      if (xPos < imageWidth && yPos < imageHeight) {
        return ((yPos * imageWidth * multiplier) + (xPos * multiplier)) | 0;
      } else {
        return -1;
      }


      //if (xPos < imageWidth && yPos < imageHeight) { todo: put this in here!
    },

    _setPixelEndianSafe: function(isLittleEndian, red, green, blue, alpha) {
      if (isLittleEndian) {
        return (alpha << 24) | (blue << 16) | (green << 8) | red;
      } else {
        return (red << 24) | (green << 16) | (blue << 8) | alpha;
      }
    },

    _isLittleEndian: function() {
      var buf = new ArrayBuffer(12);
      var uInt32Array = new Uint32Array(buf);

      uInt32Array[1] = 0x0a0b0c0d;

      if (buf[4] === 0x0a && buf[5] === 0x0b && buf[6] === 0x0c && buf[7] === 0x0d) {
        return false;
      } else {
        return true;
      }
    },

    pixelate_old: function(imageData, fitObj) {
      // calculate the 'pixel' width and height
      var xPixels = fitObj.xPixels;
      var yPixels = fitObj.yPixels;
      var pixelWidth = fitObj.pixelWidth;
      var pixelHeight = fitObj.pixelHeight;
      var imageWidth = imageData.width;
      var imageHeight = imageData.height;
      var isLittleEndian = this._isLittleEndian();

      // Loop over each (super)pixel (x and y)
      for (var pixelXNum = 0; pixelXNum < xPixels; pixelXNum++) {
        for (var pixelYNum = 0; pixelYNum < yPixels; pixelYNum++) {

          var colorModeObj = {
            map: {},
            mode: null,
            modeCount: 1
          };

          for (var loopNum = 1; loopNum <= 2; loopNum++) {
            var mode = [];

            if (loopNum !== 1 && colorModeObj.mode !== null) {
              mode = colorModeObj.mode.split('.');
            }

            // Loop over each "pixel" within a pixelated-pixel
            for (var subPixelXNum = 0; subPixelXNum < pixelWidth; subPixelXNum++) {
              for (var subPixelYNum = 0; subPixelYNum < pixelHeight; subPixelYNum++) {
                var first = false;

                if (subPixelXNum === 0 && subPixelYNum === 0) {
                  first = true;
                }
                var xPos = (pixelXNum * pixelWidth) + subPixelXNum;
                var yPos = (pixelYNum * pixelHeight) + subPixelYNum;
                var arrayIndexNumber = (yPos * imageWidth * 4) + (xPos * 4);

                if (xPos < imageWidth && yPos < imageHeight) {
                  if (loopNum === 1) {
                    this._getMode(colorModeObj, imageData.data, arrayIndexNumber, first);
                  } else {
                    if (subPixelXNum === pixelWidth - 1 || subPixelYNum === pixelHeight - 1) {
                      // If it's the bottom or right side, draw the grid
                      imageData.data[arrayIndexNumber | 0] = 50; //R
                      imageData.data[arrayIndexNumber + 1 | 0] = 50; //G
                      imageData.data[arrayIndexNumber + 2 | 0] = 50; //B
                      imageData.data[arrayIndexNumber + 3 | 0] = 255; //Clear out any alpha channel
                    } else {
                      // otherwise draw the entire pixel the mode's color

                      if (mode[3] < 128) {
                        imageData.data[arrayIndexNumber | 0] = 0; //R
                        imageData.data[arrayIndexNumber + 1 | 0] = 0; //G
                        imageData.data[arrayIndexNumber + 2 | 0] = 0; //B
                        imageData.data[arrayIndexNumber + 3 | 0] = 0; //Clear out any alpha channel
                      } else {
                        imageData.data[arrayIndexNumber | 0] = mode[0]; //R
                        imageData.data[arrayIndexNumber + 1 | 0] = mode[1]; //G
                        imageData.data[arrayIndexNumber + 2 | 0] = mode[2]; //B
                        imageData.data[arrayIndexNumber + 3 | 0] = 255; //Clear out any alpha channel
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      return imageData;
    },
  };

  if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
    self.pixelateBehavior = pixelateBehavior;
  } else {
    window.pixelateBehavior = pixelateBehavior;
  }
})();
