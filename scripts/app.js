!function(e){"use strict";var r=e.querySelector("#app");r.displayInstalledToast=function(){e.querySelector("#caching-complete").show()},r.addEventListener("dom-change",function(){console.log("Our app is ready to rock!")}),window.addEventListener("WebComponentsReady",function(){}),addEventListener("paper-header-transform",function(r){var t=e.querySelector(".app-name"),a=e.querySelector(".middle-container"),n=e.querySelector(".bottom-container"),o=r.detail,s=o.height-o.condensedHeight,c=Math.min(1,o.y/s),l=.5,d=Math.max(l,(s-o.y)/(s/(1-l))+l),i=1-c;Polymer.Base.transform("translate3d(0,"+100*c+"%,0)",a),Polymer.Base.transform("scale("+i+") translateZ(0)",n),Polymer.Base.transform("scale("+d+") translateZ(0)",t)}),addEventListener("routeChanged",function(){var r=e.querySelector("#paperDrawerPanel");r.narrow&&r.closeDrawer()})}(document);