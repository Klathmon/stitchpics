(function() {
  'use strict';

  var behavior = {
    /**
     * Scales the given image to the newWidth
     * DOES NOT WORK IN A WEB WORKER
     * @param  {object} imageData the image data to scale
     * @param  {int}    newWidth  the width of the resulting imageData
     * @return {Promise}          resolve(imageData)
     */
    oldscale({imageData, newWidth}) {
      return new Promise((resolve, reject) => {
        // First figure out the number to scale by
        var scale = newWidth / imageData.width;

        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.width = imageData.width * scale;
        canvas.height = imageData.height * scale;

        var newCanvas = document.createElement('canvas');
        this._writeImageData(newCanvas, imageData);

        // Scale 'er
        context.scale(scale, scale);
        context.drawImage(newCanvas, 0, 0);

        // Return the new sized image
        resolve(context.getImageData(0, 0, canvas.width, canvas.height));
      });
    },

    scale({imageData, newWidth}){
      let sizor = new Sizor();
      var ratio = newWidth / imageData.width;

      let canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = Math.floor(imageData.height * ratio);
      let newImageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);

      return sizor.scale(imageData, newImageData);
    },

    /**
     * splits the given imageData into numberOfParts chunks of imageData
     * DOES NOT WORK IN A WEB WORKER
     * @param  {object} imageData     the image data to split up
     * @param  {int}    numberOfParts the number of chunks to make
     * @param  {int}    pixelHeight   the height (in true pixels) of each "block" or "superpixel"
     * @return {Promise}              resolve(chunks)
     */
    *splitGenerator({imageData, numberOfParts, pixelHeight}) {
      var {data, width, height} = imageData;

      var chunkHeightExact = Math.floor(height / numberOfParts);
      var numberOfPixelsHigh = Math.ceil(chunkHeightExact / pixelHeight);
      var chunkHeight = numberOfPixelsHigh * pixelHeight;

      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      this._writeImageData(canvas, imageData);

      for (let chunkNumber = 0; chunkNumber < numberOfParts; chunkNumber++){
        var startY = chunkNumber * chunkHeight;

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

    /**
     * Stitches an array of chunks back together
     * DOES NOT WORK IN A WEB WORKER
     * @param  {array}  chunks an array of chunks of ImageData()
     * @param  {object} canvas The canvas to dump the image into
     */
    stitch({chunks, canvas}){
      var imageWidth = chunks[0].width;
      var imageHeight = chunks.reduce((runningTotal, chunk)=>{
        return runningTotal + chunk.height;
      }, 0);

      canvas.width = imageWidth;
      canvas.height = imageHeight;

      var context = canvas.getContext('2d');

      chunks.forEach((chunk, index) =>{
        // Use the first chunk's height as the multiplier.
        // As the last one is different, so it will be offset by the difference
        var startY = index * chunks[0].height;
        context.putImageData(chunk, 0,  startY);
      }, this);
    }
  };

  self.sizingBehavior = behavior;
})();
