
(function() {
  'use strict';
  /*jshint -W064 */
  Polymer({
  /*jshint +W064 */
    is: 'main-page',

    properties: {
      clothCount: {
        type: Number,
        value: 14
      },
      size: {
        type: Number,
        value: 6
      },
      numColors: {
        type: Number,
        value: 12
      },
      useDmcColors: {
        type: Boolean,
        value: false
      },
      hideTheGrid: {
        type: Boolean,
        value: false
      },
      imageHash: {
        type: String,
        observer: 'loadImage'
      },
      imageData: {
        type: Array
      },
      gridWidth: {
        type: Number,
        computed: 'calcGridWidth(clothCount, size)'
      },
    },

    ready(){
      //TODO: attach event listener for page change here to get url info
    },

    loadImage(){
      if(typeof this.imageHash !== 'undefined' && this.imageHash.length > 3){
        this._getImageDataFromHash(this.imageHash, (imageData)=>{
          this.imageData = imageData;
        });
      }
    },

    calcGridWidth(clothCount, size){
      return clothCount * size;
    },

    saveImage(){
      this.$.crossStitchElement.saveAsImage();
    },

    getImageAsDataURI(element){
      var image = new Image();
      image.src = element.getImageAsURI();
      image.style['image-rendering']='pixelated';
      image.style.display = 'block';
      return image;
    },

    openNewTab(){
      var image = this.getImageAsDataURI(this.$.crossStitchElement);
      image.style.width='100%';

      var palette = this.$.imagePalette.getColorKey();
      palette.style.width = '100%';

      var container = document.createElement('div');
      container.innerHTML = image.outerHTML + palette.outerHTML;
      var newTab = window.open('');
      newTab.document.write(container.outerHTML);
    },

    printImage(){
      var image = this.getImageAsDataURI(this.$.crossStitchElement);
      image.style.height = 'auto';
      image.style.width = 'auto';
      image.style.maxHeight = '100%';
      image.style.maxWidth = '100%';
      image.style.marginLeft = 'auto';
      image.style.marginRight = 'auto';
      image.style.marginTop = '0';
      image.style.marginBottom = '0';


      var palette = this.$.imagePalette.getColorKey();
      palette.style.width = '100%';

      var container = document.createElement('div');
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.margin = '0';
      container.innerHTML = image.outerHTML + palette.outerHTML;
      var newTab = window.open('');
      newTab.document.write(container.outerHTML);
      newTab.focus(); // Required for IE (if I ever support it...)
      newTab.print();
    },

    _getImageDataFromHash(hash, callback){
      let url = '//i.imgur.com/' + hash + '.jpg';
      let img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = function(){
        var canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;

        var context = canvas.getContext("2d");
        context.drawImage(this, 0, 0);
        callback(context.getImageData(0, 0, canvas.width, canvas.height));
      };

      img.src = url;
    }
  });
})();
