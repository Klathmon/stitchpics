(function() {
  'use strict';
  /*jshint -W064 */
  Polymer({
  /*jshint +W064 */
    is: 'palette-viewer',

    properties: {
      palette: {
        type: Array,
        observer: '_showPalette'
      }
    },

    getImageAsURI(){
      return this.$.paletteOutput.toDataURL('image/png');
    },

    _showPalette(){

      var canvas = this.$.paletteOutput; //document.createElement('canvas');
      var width = Polymer.dom(this).node.offsetWidth;
      var multiplier = Math.floor(width / 10);
      width = multiplier * 10;
      var height = Math.ceil((multiplier * this.palette.length) / width) * multiplier;

      canvas.width = width;
      canvas.height = height;
      var context = canvas.getContext('2d');

      // First make the whole thing white
      context.fillStyle = 'white';
      context.fillRect(0, 0, width, height);

      this.palette.forEach((color, index)=>{
        context.fillStyle = `rgb(${color.join(',')})`;
        var indexMultiplied = index * multiplier;
        var x = indexMultiplied % width;
        var y = Math.floor(indexMultiplied / width) * multiplier;
        context.fillRect(x, y, multiplier, multiplier);
      });
    }

  });
})();
