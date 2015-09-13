(function(){
  'use strict';
  /*jshint -W064 */
  Polymer({
  /*jshint +W064 */
    is: 'stampy-router',

    properties: {
      storedNodes: {
        type: Object,
        value: {}
      }
    },

    ready(){
      page('/', '/app');

      [...Polymer.dom(this).childNodes].forEach((element)=>{
        if(typeof element.tagName !== 'undefined' && element.tagName.toLowerCase() === 'section'){
          var {route, href} = element.dataset;
          this.storedNodes[route] = element.parentElement.removeChild(element);
          page(href, (context)=>{
            Polymer.dom(this).innerHTML = '';
            Polymer.dom.flush();
            Polymer.dom(this).appendChild(this.storedNodes[route]);
            this.async(()=>this.fire('stampy-navigation', context));
          });
        }
      });

      page({
        hashbang: true, // add #! before urls
        decodeURLComponents: true
      });
    },

  });
})();
