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
          ::this._setupSuperPixelData(imageData, palette); // jshint ignore:line
          ::this._resizeOutputCanvas(imageData); // jshint ignore:line
          return this._quantize(imageData, palette);
        }).then((imageData)=>{
          return this._pixelate(
            imageData,
            this.superPixelData.pixelWidth,
            this.superPixelData.pixelHeight,
            this.superPixelData.xPixels,
            this.superPixelData.yPixels,
            this.hidethegrid
          );
        }).then((newImageData)=>{
          this._writeImageData(this.$.finalOutput, this._convertToRealImageData(newImageData));
        });
        /*
          pixelWidth: this.superPixelData.pixelWidth,
          pixelHeight: this.superPixelData.pixelHeight,
          xPixels: this.superPixelData.xPixels,
          yPixels: this.superPixelData.yPixels,
          hideTheGrid: this.hidethegrid*/
      /*
      // First, scale the image correctly
      this._scaleImage.bind(this)()
      .then(this._dispatchBuildPalette.bind(this))
      .then(this._processImage.bind(this))
      .catch(this._catchErrors);*/
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
      return Workor.dispatchWorker(function(imageData, numColors, useDmcColors){
        // Inside the worker now, don't have any closed over variables...
        let quantizor = new Quantizor(imageData, useDmcColors);
        let palette = quantizor.buildPalette(numColors);

        this.deferred().transferResolve([imageData, palette], [imageData.data.buffer]);
      }, [imageData, numColors, useDmcColors], [imageData.data.buffer]);
    },

    _quantize(imageData, palette, useDmcColors){
      return Workor.dispatchWorker(function(imageData, palette, useDmcColors){
        // Inside the worker now, don't have any closed over variables...
        let quantizor = new Quantizor(imageData, useDmcColors);
        let newImageData = quantizor.quantize(palette);
        this.deferred().transferResolve(newImageData, [newImageData.data.buffer]);

      }, [imageData, palette, useDmcColors], [imageData.data.buffer]);
    },

    _pixelate(imageData, spWidth, spHeight, numSpx, numSpy, hideTheGrid){
      return Workor.dispatchWorker(function(imageData, spWidth, spHeight, numSpx, numSpy, hideTheGrid){
        // Inside the worker now, don't have any closed over variables...
        let pixelator = new Pixelator(imageData, spWidth, spHeight, numSpx, numSpy, hideTheGrid);
        let pixelatedImageData = pixelator.run();
        this.deferred().transferResolve(pixelatedImageData, [pixelatedImageData.data.buffer]);
      }, [imageData, spWidth, spHeight, numSpx, numSpy, hideTheGrid], [imageData.data.buffer]);
    },


    _dispatchBuildPalette(imageData) {
      return this.dispatchWorker('buildPalette', {
        imageData: this._convertToFakeImageData(imageData),
        numColors: this.numcolors,
        useDmcColors: this.usedmccolors}, [imageData.data.buffer])
      .then(({imageData, palette})=>{
        return Promise.resolve({imageData, palette});
      }).catch(this._catchErrors);
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

    _setupSuperPixelData(imageData, palette){
      this.palette = palette;
      this.superPixelData = {
        xPixels: this.gridwidth,
        yPixels: Math.floor(imageData.height * (this.gridwidth / imageData.width))
      };
      this.superPixelData.pixelWidth = Math.ceil(imageData.width / this.superPixelData.xPixels);
      this.superPixelData.pixelHeight =  Math.ceil(imageData.height / this.superPixelData.yPixels);
    },

    _resizeOutputCanvas(imageData){
      this.$.finalOutput.width = imageData.width;
      this.$.finalOutput.height = imageData.height;
    },

    _dispatchQuantize(chunk){
      return this.dispatchWorker('quantize', {
        imageData: chunk,
        palette: this.palette,
        useDmcColors: this.usedmccolors
      }, [chunk.data.buffer])
    },

    _dispatchPixelate({imageData}){
      return this.dispatchWorker('pixelate', {
        imageData,
        pixelWidth: this.superPixelData.pixelWidth,
        pixelHeight: this.superPixelData.pixelHeight,
        xPixels: this.superPixelData.xPixels,
        yPixels: this.superPixelData.yPixels,
        hideTheGrid: this.hidethegrid
      }, [imageData.data.buffer]);
    },

  });
})();
