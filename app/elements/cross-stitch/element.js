(function() {
  'use strict';
  /*jshint -W064 */
  Polymer({
  /*jshint +W064 */
    is: 'cross-stitch',
    behaviors: [
      window.processingFunctions
    ],

    properties: {
      numcolors: {
        type: Number,
        observer: 'propertyChanged'
      },
      gridwidth: {
        type: Number,
        observer: 'propertyChanged'
      },
      imagedata: {
        type: Object,
        observer: 'propertyChanged'
      },
      usedmccolors: {
        type: Boolean,
        observer: 'propertyChanged'
      },
      hidethegrid: {
        type: Boolean,
        observer: 'propertyChanged'
      },
      palette: {
        type: Array,
        notify: true
      },
      numberOfCores: {
        type: Number,
        value: 4
      },
      numberOfChunksDone: {
        type: Number,
        value: 0
      },
      workor: {
        type: Object
      },
    },

    ready() {
      let finalOutput = this.$.finalOutput;
      finalOutput.imageSmoothingEnabled =
      finalOutput.msImageSmoothingEnabled =
      finalOutput.mozImageSmoothingEnabled =
      finalOutput.webkitImageSmoothingEnabled = false;

      window.addEventListener('resize', _.debounce(this.propertyChanged.bind(this), 250));

      this.numberOfCores = navigator.hardwareConcurrency || 4;
      this.workor = new Workor(this.numberOfCores);
    },

    propertyChanged(){
      if(typeof this.imagedata !== 'undefined'){
        this.newFile();
      }
    },

    newFile() {
      this.startTime = performance.now();
      this.resizeAbsurdImageData.bind(this)();
      this.scaleImage(this.imagedata, Polymer.dom(this).node.offsetWidth)
        .then((scaledImageData)=>{
          return this.buildPalette(scaledImageData, this.numcolors, this.usedmccolors);
        }).then(([imageData, palette])=>{
          this.manipulateImage.bind(this)(imageData, palette);
        });
    },

    manipulateImage(imageData, palette){
      this.palette = palette;
      let context = this.$.finalOutput.getContext('2d');
      let xPixels = this.gridwidth;
      let yPixels = Math.floor(imageData.height * (this.gridwidth / imageData.width));
      let pixelWidth = Math.ceil(imageData.width / xPixels);
      let pixelHeight =  Math.ceil(imageData.height / yPixels);

      this.$.finalOutput.width = imageData.width;
      this.$.finalOutput.height = imageData.height;

      for(let {chunk, chunkStartY} of this.splitGenerator.bind(this)(imageData, this.numberOfCores, pixelHeight)){
        // Chunk off pieces and throw them right into the quantize process
        this.quantize(chunk, palette).then((imageData)=>{
          // And the second one is done pipe it back to pixelate
          return this.pixelate(
            imageData,
            pixelWidth,
            pixelHeight,
            xPixels,
            yPixels,
            this.hidethegrid
          );
        }).then((finishedChunk)=>{
          // And when each chunk is finished write it right out
          context.putImageData(ImageDataHelpers.convertToRealImageData(finishedChunk), 0,  chunkStartY);
          console.log('Wrote chunk at ' + (performance.now() - this.startTime) + ' milliseconds!');
          if(++this.numberOfChunksDone === this.numberOfCores){
            this.fire('crossStitchDone', ImageDataHelpers.readImageData(this.$.finalOutput));
          }
        });
      }
    },


    saveAsImage(){
      var context = this.$.finalOutput.getContext('2d');

      this.$.finalOutput.toBlob((blob)=>{
        saveAs(blob, "CrossStitch.png");
      });
    },

    getImageAsURI(){
      return this.$.finalOutput.toDataURL('image/png');
    },

    resizeAbsurdImageData(){
      let maxSize = Math.max(window.innerWidth, window.innerHeight);
      if(this.imagedata.width > maxSize){
        this.scaleImage(this.imagedata, maxSize).then((downscaledImageData)=>{
          this.imagedata = downscaledImageData;
          console.log('Downscaled really big image');
        });
      }
    },

    /**
     * splits the given imageData into numberOfParts chunks of imageData
     * DOES NOT WORK IN A WEB WORKER
     * @param  {object} imageData     the image data to split up
     * @param  {int}    numberOfParts the number of chunks to make
     * @param  {int}    pixelHeight   the height (in true pixels) of each "block" or "superpixel"
     * @return {Promise}              resolve(chunks)
     */
    *splitGenerator(imageData, numberOfParts, pixelHeight) {
      let {data, width, height} = imageData;

      let chunkHeightExact = Math.floor(height / numberOfParts);
      let numberOfPixelsHigh = Math.ceil(chunkHeightExact / pixelHeight);
      let chunkHeight = numberOfPixelsHigh * pixelHeight;

      let canvas = document.createElement('canvas');
      let context = canvas.getContext('2d');
      ImageDataHelpers.writeImageData(canvas, imageData);

      for (let chunkNumber = 0; chunkNumber < numberOfParts; chunkNumber++){
        let startY = chunkNumber * chunkHeight;

        // If this is the last chunk, add the remainder of pixels that didn't
        // divide evently on to it.
        if (chunkNumber === numberOfParts - 1) {
          chunkHeight = height - (chunkHeight * chunkNumber);
        }
        // yield the chunk
        yield {
          chunk: context.getImageData(0, startY, width, chunkHeight),
          chunkStartY: startY
        };
      }
    },

    _catchErrors(error) {
      console.error(error.stack);
    }

  });
})();
