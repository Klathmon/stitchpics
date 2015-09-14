(function(document) {
  'use strict';

  var app = document.querySelector('#app');

  app.addEventListener('dom-change', ()=> {
    console.log('Our app is ready to rock!');
  });

  window.addEventListener('paper-header-transform', (event)=>transformHeader(event.detail));

  window.addEventListener('stampy-navigation', (event)=>{
    let context = event.detail;
    closeDrawerIfOpen(document.querySelector('#paperDrawerPanel'));
    assignUrlParams(context.params);
  });


  let transformHeader = function transformHeader(detail){
    // Main area's paper-scroll-header-panel custom condensing transformation of
    // the appName in the middle-container and the bottom title in the bottom-container.
    // The appName is moved to top and shrunk on condensing. The bottom sub title
    // is shrunk to nothing on condensing.
    let appName = document.querySelector('.app-name');
    let middleContainer = document.querySelector('.middle-container');
    let bottomContainer = document.querySelector('.bottom-container');
    let heightDiff = detail.height - detail.condensedHeight;
    let yRatio = Math.min(1, detail.y / heightDiff);
    let maxMiddleScale = 0.50;  // appName max size when condensed. The smaller the number the smaller the condensed size.
    let scaleMiddle = Math.max(maxMiddleScale, (heightDiff - detail.y) / (heightDiff / (1-maxMiddleScale))  + maxMiddleScale);
    let scaleBottom = 1 - yRatio;

    //Translate stuff!
    Polymer.Base.transform('translate3d(0,' + yRatio * 100 + '%,0)', middleContainer);
    Polymer.Base.transform('scale(' + scaleBottom + ') translateZ(0)', bottomContainer);
    Polymer.Base.transform('scale(' + scaleMiddle + ') translateZ(0)', appName);
  };

  let closeDrawerIfOpen = function closeDrawerIfOpen(drawer){
    if (drawer.narrow) {
      drawer.closeDrawer();
    }
  };

  let assignUrlParams = function assignUrlParams(params){
    //Assign the keys to this
    if(typeof params !== 'undefined'){
      Object.keys(params).forEach((key)=>{
        let value = params[key];
        if(typeof value !== 'undefined'){
          console.log(key, value);
          app[key] = value;
        }
      });
    }
  }

})(document);
