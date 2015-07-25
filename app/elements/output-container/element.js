(function() {
  'use strict';
  /*jshint -W064 */
  Polymer({
  /*jshint +W064 */
    is: 'output-container',

    properties: {
      numcolors: {
        type: Number
      },
      gridwidth: {
        type: Number
      },
      imagedata: {
        type: Array
      },
    },

    saveImage(){
      this.$.crossStitchElement.saveAsImage();
    }
  });
})();
