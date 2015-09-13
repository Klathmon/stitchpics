(function() {
  'use strict';
  /*jshint -W064 */
  Polymer({
  /*jshint +W064 */
    is: 'my-analytics',

    properties: {
      trackingCode: {
        type: String
      }
    },

    ready(){
      this.isogram(window, document, 'script', '//www.google-analytics.com/analytics.js', 'myGA');
      myGA('create', this.trackingCode, 'auto');
      window.addEventListener('stampy-navigation', this.navigationOccured.bind(this));
    },

    navigationOccured({detail}){
      let {canonicalPath, title} = detail;
      this.sendPageview('/#!' + canonicalPath, title);
    },

    sendPageview(canonicalPath, title){
      myGA('set', {
        page: canonicalPath,
        title
      });
      myGA('send', 'pageview');
      console.log('Page view sent.');
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
