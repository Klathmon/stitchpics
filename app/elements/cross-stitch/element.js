(function() {
  'use strict';
  /*jshint -W064 */
  Polymer({
    /*jshint +W064 */
    is: 'cross-stitch',
    behaviors: [
      window.sizingBehavior,
      window.quantizeBehavior,


      window.crossStitchBehavior,
      window.workerBehavior,
      window.pixelateBehavior,
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
      }
    },

    ready() {
      this.$.finalOutput.imageSmoothingEnabled = false;
      this.$.finalOutput.msImageSmoothingEnabled = false;
      this.$.finalOutput.mozImageSmoothingEnabled = false;
      this.$.finalOutput.webkitImageSmoothingEnabled = false;

      var numberOfCores = navigator.hardwareConcurrency || 4;
      var workerScript;

      this.createWorkers('libs.js', numberOfCores);

    },



    newFile() {

      // First, scale the image correctly
      this.scale({
        imageData: this.imageData,
        newWidth: Polymer.dom(this).node.offsetWidth
      }).then((imageData) => {
        // Then build the palette
        return this.buildPalette({imageData, numColors: this.numcolors});
      }).then(({imageData, palette})=>{
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
      }).then((chunks) => {
        // For each chunk, quantize the image
        return Promise.all(chunks.map((chunk, index)=>{
          return this.quantize({
            imageData: chunk,
            palette: this.palette,
            index
          });
        }).map((quantizePromise)=> quantizePromise.then(({imageData, index})=>{
            // After each chunk is quantized, pixelate it.
            return this.pixelate({
              imageData,
              pixelWidth: this.superPixelData.pixelWidth,
              pixelHeight: this.superPixelData.pixelHeight,
              xPixels: this.superPixelData.xPixels,
              yPixels: this.superPixelData.yPixels,
              index});
          })
        ));
      }).then((donePromises)=>{
        // We are all done with all of the chunks here, so stitch them back together in the output
        return this.stitch({
          chunks: donePromises.reduce((chunks, {imageData, index})=>{
            // I really like to abuse reduce, it's just so useful!
            chunks[index] = this._convertToRealImageData(imageData);
            return chunks;
          }, new Array(this.workers.length)),
          canvas: this.$.finalOutput
        });
      }).catch((error) =>{
        console.error(error.stack);
      });
    },

    _convertToRealImageData(pImageData){
      var realImageData = document.createElement('canvas')
        .getContext('2d')
        .createImageData(pImageData.width, pImageData.height);

      realImageData.data.set(pImageData.data);
      return realImageData;
    },

    oldNewFile() {
      this.startTime = performance.now();
      // Scale the image to the correct size
      var scaledImageData = this.scale(this.imageData, Polymer.dom(this).node.offsetWidth);

      // Get the fitObj
      var fitObj = this.fit(scaledImageData, this.gridwidth);

      //this.split(scaledImageData, this.workers.length, fitObj).forEach(function(chunk, index){

      //});

      // Build the palette
      var rgbq = this.buildPalette(scaledImageData, this.numcolors);

      // Break the image into chunks
      var scaledChunks = this.split(scaledImageData, this.workers.length, fitObj);

      var doneChunks = [];

      scaledChunks.forEach(function(chunk, index) {
        var quantizeData = {
          imageDataBuffer: chunk.data.buffer,
          imageWidth: chunk.width,
          imageHeight: chunk.height,
          palette: rgbq.palette(true),
          numColors: this.numcolors,
          index: index
        };

        this.dispatchWorker(function(event) {
          var pixelateData = {
            imageDataBuffer: event.data.imageDataBuffer,
            imageWidth: event.data.imageWidth,
            imageHeight: event.data.imageHeight,
            fitObj: fitObj,
            index: event.data.index
          };

          this.dispatchWorker(function(event) {

            var doneImageData = workerBehavior.buildImageDataFromBuffer(
              event.data.imageDataBuffer,
              event.data.imageWidth,
              event.data.imageHeight
            );

            // Done everything for this chunk...
            doneChunks[event.data.index] = doneImageData;

            var numberOfChunksDone = doneChunks.filter(function(value) {
              return value !== undefined;
            }).length;

            if (numberOfChunksDone === scaledChunks.length) {
              //If we get here we are completely done!!!

              this.stitch(doneChunks, this.$.finalOutput);
              this.endTime = performance.now();


              console.log('Done everything in ' + (this.endTime - this.startTime) + ' milliseconds!');
            }
          }, 'pixelate', pixelateData, [pixelateData.imageDataBuffer]);
        }, 'quantize', quantizeData, [quantizeData.imageDataBuffer]);
      }, this);
    }
  });
})();
