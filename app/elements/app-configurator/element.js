(function() {
  'use strict';
  /*jshint -W064 */
  Polymer({
  /*jshint +W064 */
    is: 'app-configurator',

    properties: {
      numcolors: {
        type: Number,
        readOnly: true
      },
      gridwidth: {
        type: Number,
        readOnly: true
      },
      selected: {
        type: Number,
        value: 0
      },
    },
    _test() {
      console.log(this.aidaClothCounts[this.aidaClothSelected]);
    }

  });
})();
