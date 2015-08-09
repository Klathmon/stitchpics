
(function() {
  'use strict';
  /*jshint -W064 */
  Polymer({
  /*jshint +W064 */
    is: 'main-page',


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
      gridWidth: {
        type: Number,
        computed: 'calcGridWidth(clothCount, size)'
      },

    }
  });
})();
