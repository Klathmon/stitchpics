(function() {
  'use strict';
  /*jshint -W064 */
  Polymer({
  /*jshint +W064 */
    is: 'cross-stitch',
    behaviors: [window.crossStitchBehavior, window.workerBehavior, window.pixelateBehavior],

    properties:{
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
      fastquant: {
        type: Boolean,
        value: false
      }
    },

    ready(){
      this.$.finalOutput.imageSmoothingEnabled = false;
      this.$.finalOutput.msImageSmoothingEnabled = false;
      this.$.finalOutput.mozImageSmoothingEnabled = false;
      this.$.finalOutput.webkitImageSmoothingEnabled = false;

      var numberOfCores = navigator.hardwareConcurrency || 4;
      var workerScript;

      this.createWorkers('libs.js', numberOfCores);

    },

    newFile(){
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

      scaledChunks.forEach(function(chunk, index){
        var quantizeData = {
          imageDataBuffer: chunk.data.buffer,
          imageWidth: chunk.width,
          imageHeight: chunk.height,
          palette: rgbq.palette(true),
          numColors: this.numcolors,
          index: index
        };

        this.dispatchWorker(function(event){
          var pixelateData = {
            imageDataBuffer: event.data.imageDataBuffer,
            imageWidth: event.data.imageWidth,
            imageHeight: event.data.imageHeight,
            fitObj: fitObj,
            index: event.data.index
          };

          this.dispatchWorker(function(event){

            var doneImageData = workerBehavior.buildImageDataFromBuffer(
              event.data.imageDataBuffer,
              event.data.imageWidth,
              event.data.imageHeight
            );

            // Done everything for this chunk...
            doneChunks[event.data.index] = doneImageData;

            var numberOfChunksDone = doneChunks.filter(function(value){
              return value !== undefined;
            }).length;

            if(numberOfChunksDone === scaledChunks.length){
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
