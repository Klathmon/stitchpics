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
      [...Polymer.dom(this).childNodes].forEach((element)=>{
        if(typeof element.tagName !== 'undefined' && element.tagName.toLowerCase() === 'section'){
          var {route, href} = element.dataset;
          this.storedNodes[route] = element.parentElement.removeChild(element);
          page(href, (context)=>{
            this.routerContext = context;
            //this.$.analytics.pageView(this.routerContext.canonicalPath, this.routerContext.title);
            Polymer.dom(this).innerHTML = '';
            Polymer.dom(this).appendChild(this.storedNodes[route]);
          });
        }
      });
      Polymer.dom(this).innerHTML = '';
      Polymer.dom.flush();

      // add #! before urls
      page({hashbang: true});
    },

  });
})();
