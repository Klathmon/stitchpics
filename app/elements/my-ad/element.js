(function() {
  'use strict';
  /*jshint -W064 */
  Polymer({
  /*jshint +W064 */
    is: 'my-ad',

    properties: {
      client: {
        type: String
      },
      slot: {
        type: String
      },
      format: {
        type: String,
        value: 'auto'
      },
    },

    ready(){
      let ins = document.createElement('ins');
      ins.dataset.adClient = this.client;
      ins.dataset.adSlot = this.slot;
      ins.dataset.adFormat = this.format;
      ins.style.display = 'block';
      ins.classList.add('adsbygoogle');
      Polymer.dom(this.root).appendChild(ins);

      let script = document.createElement('script');
      script.type = 'text/javascript';
      script.appendChild(document.createTextNode('(adsbygoogle = window.adsbygoogle || []).push({});'));
      Polymer.dom(this.root).appendChild(script);
    }
  });
})();
