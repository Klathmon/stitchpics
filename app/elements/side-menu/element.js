(function(){
  'use strict';
  /*jshint -W064 */
  Polymer({
  /*jshint +W064 */
    is: 'side-menu',

    properties: {
      route: {
        type: String,
        notify: true,
        observer: 'routeChanged'
      },
      routes: {
        type: Array,
        value: [
          {
            'route': 'app',
            'icon': 'home',
            'href': '/#!/app',
            'text': 'Home'
          },
          {
            'route': 'faq',
            'icon': 'info',
            'href': '/#!/faq',
            'text': 'FAQ'
          },
        ]
      }
    },

    routeChanged(){
      this.fire('routeChanged', {
        route: this.route
      });
    },
  });
})();
