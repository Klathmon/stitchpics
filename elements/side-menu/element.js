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
      },
      socialButtons: {
        type: Array,
        value: [
          {
            'class': 'facebook button',
            'href': 'https://www.facebook.com/sharer/sharer.php?u=',
            'text': 'Facebook'
          },
          {
            'class': 'google button',
            'href': 'https://plus.google.com/share?url=',
            'text': 'Google +'
          },
          {
            'class': 'twitter button',
            'href': 'https://twitter.com/intent/tweet?url=',
            'text': 'Twitter'
          },
        ]
      }
    },

    routeChanged(){
      this.fire('routeChanged', {
        route: this.route
      });
    },

    loadHref(event){
      let button = event.path[1];
      window.open(button.dataset.href + window.location.href, 'Share', 'width=580,height=296');
    }
  });
})();
