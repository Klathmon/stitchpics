(function() {
  'use strict';
  /*jshint -W064 */
  Polymer({
  /*jshint +W064 */
    is: 'cross-stitch',
    behaviors: [
      window.sizingBehavior,
      window.quantizeBehavior,
      window.pixelateBehavior,
      window.workerBehavior,
    ],

    properties: {
      numcolors: {
        type: Number,
        value: 16
      },
      gridwidth: {
        type: Number,
        value: 50
      },
      imageData: {
        type: Object
      },
      superPixelData: {
        type: Object
      },
      palette: {
        type: Array,
        notify: true
      }
    },

    ready() {
      this.$.finalOutput.imageSmoothingEnabled =
      this.$.finalOutput.msImageSmoothingEnabled =
      this.$.finalOutput.mozImageSmoothingEnabled =
      this.$.finalOutput.webkitImageSmoothingEnabled = false;

      var numberOfCores = navigator.hardwareConcurrency || 4;

      this.createWorkers('libs.js', numberOfCores);

    },

    newFile() {
      this.startTime = performance.now();

      // First, scale the image correctly
      this._scaleImage.bind(this)()
      .then(this._buildPalette.bind(this))
      .then(this._splitImage.bind(this))
      .then(this._quantizeChunks.bind(this))
      .then(this._doneChunks.bind(this))
      .catch(this.handleErrors);
    },

    _scaleImage(){
      return this.scale({
        imageData: this.imageData,
        newWidth: Polymer.dom(this).node.offsetWidth
      });
    },

    _buildPalette(imageData) {
      // Then build the palette
      return this.dispatchWorker('buildPalette', {imageData, numColors: this.numcolors}, [imageData.data.buffer]);
    },

    _splitImage({imageData, palette}){
      // Now save the palette and generate the "superPixelData"
      this.palette = palette;
      this.superPixelData = {
        xPixels: this.gridwidth,
        yPixels: Math.floor(imageData.height * (this.gridwidth / imageData.width))
      };
      this.superPixelData.pixelWidth = Math.ceil(imageData.width / this.superPixelData.xPixels);
      this.superPixelData.pixelHeight =  Math.ceil(imageData.height / this.superPixelData.yPixels);

      // Then split the image into chunks
      return this.split({
        imageData,
        numberOfParts: this.workers.length,
        pixelHeight: this.superPixelData.pixelHeight
      });
    },

    _quantizeChunks(chunks){
      // For each chunk, quantize the image
      return Promise.all(chunks.map((chunk, index)=>{
        return this.dispatchWorker('quantize', {
          imageData: chunk,
          palette: this.palette,
          index
        }, [chunk.data.buffer]);
      }).map((quantizePromise)=> quantizePromise.then(({imageData, index})=>{
          // After each chunk is quantized, pixelate it.
          return this.dispatchWorker('pixelate', {
            imageData,
            pixelWidth: this.superPixelData.pixelWidth,
            pixelHeight: this.superPixelData.pixelHeight,
            xPixels: this.superPixelData.xPixels,
            yPixels: this.superPixelData.yPixels,
            index}, [imageData.data.buffer]);
        })));
    },

    _doneChunks(donePromises){
      // We are all done with all of the chunks here, so stitch them back together in the output
      this.stitch({
        chunks: donePromises.reduce((chunks, {imageData, index})=>{
          // I really like to abuse reduce, it's just so useful!
          chunks[index] = this._convertToRealImageData(imageData);
          return chunks;
        }, new Array(this.workers.length)),
        canvas: this.$.finalOutput
      });

      this.endTime = performance.now();
      console.log('Done everything in ' + (this.endTime - this.startTime) + ' milliseconds!');

    },



    _convertToRealImageData(pImageData){
      var realImageData = document.createElement('canvas')
        .getContext('2d')
        .createImageData(pImageData.width, pImageData.height);

      realImageData.data.set(pImageData.data);
      return realImageData;
    },

  });
})();
