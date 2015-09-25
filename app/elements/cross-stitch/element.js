(function() {
  'use strict';
  /*jshint -W064 */
  Polymer({
  /*jshint +W064 */
    is: 'cross-stitch',
    behaviors: [
      window.miscBehavior
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
      superPixelData: {
        type: Object
      },
      palette: {
        type: Array,
        notify: true
      },
      numberOfChunksDone: {
        type: Number,
        value: 0
      },
    },

    ready() {
      let finalOutput = this.$.finalOutput;
      finalOutput.imageSmoothingEnabled =
      finalOutput.msImageSmoothingEnabled =
      finalOutput.mozImageSmoothingEnabled =
      finalOutput.webkitImageSmoothingEnabled = false;

      window.addEventListener('resize', _.debounce(this.propertyChanged.bind(this), 250));

      var numberOfCores = navigator.hardwareConcurrency || 4;
    },

    propertyChanged(){
      if(typeof this.imagedata !== 'undefined'){
        this.newFile();
      }
    },

    newFile() {
      this.startTime = performance.now();
      this._scaleImage(this.imagedata, Polymer.dom(this).node.offsetWidth)
        .then((scaledImageData)=>{
          return this._buildPalette(scaledImageData, this.numcolors, this.usedmccolors);
        }).then(([imageData, palette])=>{
          this.manipulateImage.bind(this)(imageData, palette);
        });
    },

    manipulateImage(imageData, palette){
      let numberOfChunks = navigator.hardwareConcurrency || 4;
      let context = this.$.finalOutput.getContext('2d');
      let xPixels = this.gridwidth;
      let yPixels = Math.floor(imageData.height * (this.gridwidth / imageData.width));
      let pixelWidth = Math.ceil(imageData.width / xPixels);
      let pixelHeight =  Math.ceil(imageData.height / yPixels);

      this._resizeOutputCanvas.bind(this)(imageData);

      for(let {chunk, chunkStartY} of this.splitGenerator.bind(this)(imageData, numberOfChunks, pixelHeight)){
        // Chunk off pieces and throw them right into the quantize process
        this._quantize(chunk, palette).then((imageData)=>{
          // And the second one is done pipe it back to pixelate
          return this._pixelate(
            imageData,
            pixelWidth,
            pixelHeight,
            xPixels,
            yPixels,
            this.hidethegrid
          );
        }).then((finishedChunk)=>{
          // And when each chunk is finished write it right out
          context.putImageData(this._convertToRealImageData(finishedChunk), 0,  chunkStartY);
          console.log('Wrote chunk at ' + (performance.now() - this.startTime) + ' milliseconds!');
          if(++this.numberOfChunksDone === numberOfChunks){
            this.fire('crossStitchDone', this._readImageData(this.$.finalOutput));
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

    _scaleImage(imageData, newWidth){
      return new Promise((resolve, reject)=>{
        let sizor = new Sizor();
        sizor.scale(imageData, newWidth).then(resolve);
      });
    },

    _buildPalette(imageData, numColors, useDmcColors){
      return (function(imageData, numColors, useDmcColors){
        // Inside the worker now, don't have any closed over variables...
        let quantizor = new Quantizor(imageData, useDmcColors);
        let palette = quantizor.buildPalette(numColors);

        return Promise.resolve([imageData, palette]); //, [imageData.data.buffer]);
      })(imageData, numColors, useDmcColors); //, [imageData.data.buffer]);
    },

    _quantize(imageData, palette, useDmcColors){
      return (function(imageData, palette, useDmcColors){
        // Inside the worker now, don't have any closed over variables...
        let quantizor = new Quantizor(imageData, useDmcColors);
        let newImageData = quantizor.quantize(palette);
        return Promise.resolve(newImageData); //, [newImageData.data.buffer]);

      })(imageData, palette, useDmcColors); //, [imageData.data.buffer]);
    },

    _pixelate(imageData, spWidth, spHeight, numSpx, numSpy, hideTheGrid){
      return (function(imageData, spWidth, spHeight, numSpx, numSpy, hideTheGrid){
        // Inside the worker now, don't have any closed over variables...
        let pixelator = new Pixelator(imageData, spWidth, spHeight, numSpx, numSpy, hideTheGrid);
        let pixelatedImageData = pixelator.run();
        return Promise.resolve(pixelatedImageData); //, [pixelatedImageData.data.buffer]);
      })(imageData, spWidth, spHeight, numSpx, numSpy, hideTheGrid); //, [imageData.data.buffer]);
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
      this._writeImageData(canvas, imageData);

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


    _processImage({imageData, palette}){

      ::this._setupSuperPixelData(imageData, palette); // jshint ignore:line
      ::this._resizeOutputCanvas(imageData); // jshint ignore:line

      let context = this.$.finalOutput.getContext('2d');
      let splitHash = {
        imageData,
        numberOfParts: this.workers.length,
        pixelHeight: this.superPixelData.pixelHeight
      };

      for(let {chunk, chunkStartY} of this.splitGenerator.bind(this)(splitHash)){
        this._dispatchQuantize.bind(this)(chunk)
          .then(this._dispatchPixelate.bind(this))
          .then(({imageData})=> {
            context.putImageData(this._convertToRealImageData(imageData), 0,  chunkStartY);
            console.log('Wrote chunk at ' + (performance.now() - this.startTime) + ' milliseconds!');
            if(++this.numberOfChunksDone === this.workers.length){
              this.fire('crossStitchDone', this._readImageData(this.$.finalOutput));
            }
          })
          .catch(this._catchErrors);
      }
    },

    _resizeOutputCanvas(imageData){
      this.$.finalOutput.width = imageData.width;
      this.$.finalOutput.height = imageData.height;
    },

  });
})();
