(function() {
  'use strict';
  /*jshint -W064 */
  Polymer({
  /*jshint +W064 */
    is: 'my-adsense',

    properties: {
      trackingcode: {
        type: String
      },
    },

    ready(){
      this.isogram(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
      ga('create', this.trackingcode, 'auto');
      ga('send', 'pageview');
    },

    isogram(i, s, o, g, r, a, m){
      i.GoogleAnalyticsObject = r;
      i[r] = i[r] || function() {(i[r].q = i[r].q || []).push(arguments)}, i[r].l = 1 * new Date(); // jshint ignore:line
      a = s.createElement(o),  m = s.getElementsByTagName(o)[0];  // jshint ignore:line
      a.async = 1;
      a.src = g;
      m.parentNode.insertBefore(a, m);
    }
  });
})();
