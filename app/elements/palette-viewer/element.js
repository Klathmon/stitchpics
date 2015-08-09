(function() {
  'use strict';
  /*jshint -W064 */
  Polymer({
  /*jshint +W064 */
    is: 'palette-viewer',
    behaviors: [
      window.dmcColorBehavior
    ],

    properties: {
      palette: {
        type: Array,
        observer: '_showPalette'
      },
      colors: {
        type: Array
      },
      usedmccolors: {
        type: Boolean
      },
    },

    getImageAsURI(){
      return this.$.paletteOutput.toDataURL('image/png');
    },

    _showPalette(){
      let dmcColorMap = this._getDmcColorMap();
      this.colors = this.palette.map(([r, g, b], index)=>{
        let hex = this._convertRGBToHex([r, g, b]).toUpperCase();
        let colorName =  window.ntc.name('#' + hex)[1];
        let dmcColor = (this.usedmccolor ? false : dmcColorMap.get(hex));

        return {
          hex: '#' + hex,
          swatchStyle: 'background-color: #' + hex,
          colorName,
          dmcColor
        };
      });
    }

  });
})();
