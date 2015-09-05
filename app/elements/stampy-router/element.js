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
        notify: true,
        value: {}
      }
    },

    test(){
      console.log(this.routerContext);
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
            //TODO: Fire window level event here and attach to it if this data is needed elsewhere
            window.routerContext = context;
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
