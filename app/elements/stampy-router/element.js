(function(){
  'use strict';
  /*jshint -W064 */
  Polymer({
  /*jshint +W064 */
    is: 'stampy-router',

    properties: {
      router: {
        type: Array,
        value: [
          {
            'href': '/',
            'name': 'app'
          },
          {
            'href': '/faq',
            'name': 'faq'
          },
        ]
      },
      storedNodes: {
        type: Object,
        value: {}
      }
    },

    ready(){
      [...Polymer.dom(this).childNodes].forEach((element)=>{
        if(typeof element.tagName !== 'undefined' && element.tagName.toLowerCase() === 'section'){
          var {route, href} = element.dataset;
          this.storedNodes[route] = element.parentElement.removeChild(element);
          page(href, ()=>{
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
