(function () {
  'use strict';
  var behavior = {

     _convertToRealImageData(pImageData) {
      let realImageData = document.createElement('canvas')
        .getContext('2d')
        .createImageData(pImageData.width, pImageData.height);

      realImageData.data.set(pImageData.data);
      return realImageData;
    },

    _convertToFakeImageData(imageData){
      return {
        data: imageData.data,
        height: imageData.height,
        width: imageData.width
      };
    },

    _readImageData(canvas) {
      var context = canvas.getContext('2d');
      return context.getImageData(0, 0, canvas.width, canvas.height);
    },

    _writeImageData(canvas, imageData) {
      canvas.height = imageData.height;
      canvas.width = imageData.width;
      var context = canvas.getContext('2d');
      context.putImageData(this._convertToRealImageData(imageData), 0, 0);
      return context;
    },

    _catchErrors(error) {
      console.error(error.stack);
    }
  };

  self.miscBehavior = behavior;
})();
