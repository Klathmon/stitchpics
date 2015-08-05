(function(){
  'use strict';
  /*jshint -W064 */
  Polymer({
  /*jshint +W064 */
    is: 'side-menu',

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
