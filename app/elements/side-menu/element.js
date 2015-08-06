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
            'route': 'home',
            'icon': 'home',
            'href': '/',
            'text': 'Home'
          },
          {
            'route': 'faq',
            'icon': 'info',
            'href': '/faq',
            'text': 'FAQ'
          },
        ]
      },
      socialButtons: {
        type: Array,
        value: [
          {
            'class': 'facebook button',
            'onclick': 'shareFacebook',
            'text': 'Facebook'
          },
          {
            'class': 'google button',
            'onclick': 'shareGoogle',
            'text': 'Google +'
          },
          {
            'class': 'twitter button',
            'onclick': 'shareTwitter',
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

    shareFacebook(){
      window.open('https://www.facebook.com/sharer/sharer.php?u=' + window.location.href, 'facebook-share', 'width=580,height=296');
    },

    shareGoogle(){
      window.open('https://plus.google.com/share?url=' + window.location.href, 'google-share', 'width=580,height=296');
    },

    shareTwitter(){
      window.open('https://twitter.com/intent/tweet?url=' + window.location.href, 'twitter-share', 'width=580,height=296');
    },
  });
})();
