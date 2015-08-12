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
      },
      buttonText: {
        type: String,
        value: "Upload Image"
      }
    },

    translateClick(){
      this.$.imageLoader.click();
    },

    fileUpload(event){
      var file = event.target.files[0];
      var canvas = document.createElement('canvas');

      if(event.target.files && file){
        var reader = new FileReader();
        reader.onload = (readerLoaded)=>{
          var context = canvas.getContext('2d');
          var img = new Image();
          img.onload = ()=>{
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
            this.imagedata = context.getImageData(0, 0, canvas.width, canvas.height);

            var fileName = file.name;

            if(fileName.length > 20){
              fileName = "Image";
            }

            this.buttonText = fileName + " Uploaded";
            this.$.buttonIcon.classList.remove('hidden');
          };
          img.src = readerLoaded.target.result;
        };
        reader.readAsDataURL(file);
      }
    }

  });
})();
