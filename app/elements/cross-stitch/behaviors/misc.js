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

    _catchErrors(error) {
      console.error(error.stack);
    }
  };

  self.miscBehavior = behavior;
})();
