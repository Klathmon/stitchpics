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
      },
      routerContext: {
        type: Object,
        value: {}
      }
    },

    ready(){
      page('/', '/app');

      [...Polymer.dom(this).childNodes].forEach((element)=>{
        if(typeof element.tagName !== 'undefined' && element.tagName.toLowerCase() === 'section'){
          var {route, href} = element.dataset;
          this.storedNodes[route] = element.cloneNode(true); //element.parentElement.removeChild(element);
          page(href, (context)=>{
            this.routerContext = context;
            Polymer.dom(this).innerHTML = '';
            Polymer.dom.flush();
            Polymer.dom(this).appendChild(this.storedNodes[route]);
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
