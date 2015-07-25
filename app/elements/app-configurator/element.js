(function() {
  'use strict';
  /*jshint -W064 */
  Polymer({
  /*jshint +W064 */
    is: 'app-configurator',

    calcGridWidth(internalClothCount, internalSize){
      return internalClothCount * internalSize;
    },

    translateNumColors(){
      this._setNumcolors(this.internalNumColors);
    },

    properties: {
      numcolors: {
        type: Number,
        notify: true,
        readOnly: true
      },
      gridwidth: {
        type: Number,
        notify: true,
        computed: 'calcGridWidth(internalClothCount, internalSize)'
      },
      imagedata: {
        type: Array,
        notify: true,
      },

      internalClothCount: {
        type: Number,
        value: 14
      },
      internalSize: {
        type: Number,
        value: 6
      },
      internalNumColors: {
        type: Number,
        value: 12,
        observer: 'translateNumColors'
      },
      selected: {
        type: Number,
        value: 0
      },

      ready(){
        this.translateNumColors();
      }

    },



  });
})();
