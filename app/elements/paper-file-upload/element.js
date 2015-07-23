(function() {
  'use strict';
  /*jshint -W064 */
  Polymer({
  /*jshint +W064 */
    is: 'paper-file-upload',

    properties: {
      imagedata: {
        type: Object,
        notify: true
      }
    },

    fileUpload(event){
      var target = event.target;
      var canvas = document.createElement('canvas');

      if(target.files && target.files[0]){
        var reader = new FileReader();
        reader.onload = (readerLoaded)=>{
          var context = canvas.getContext('2d');
          var img = new Image();
          img.onload = ()=>{
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
            this.imagedata = context.getImageData(0, 0, canvas.width, canvas.height);
          };
          img.src = readerLoaded.target.result;
        };
        reader.readAsDataURL(target.files[0]);
      }
    }

  });
})();
