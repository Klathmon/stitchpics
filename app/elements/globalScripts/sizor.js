class Sizor {

  /**
   * Creates the object
   */
  constructor(){
    this._bitPacker = new BitPacker();
  }

  scale(imageData, newWidth){
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
  }

  workerSafeScale(imageData, newImageData){
    return new Promise((resolve, reject)=>{
      let ratio = imageData.width / newImageData.width;
      let halfRatio = Math.ceil(ratio / 2);

      let uInt32Array = new Uint32Array(imageData.data.buffer);
      let newUInt32Array = new Uint32Array(newImageData.data.buffer);

      for(let newImgY = 0; newImgY < newImageData.height; newImgY++){
        for(let newImgX = 0; newImgX < newImageData.width; newImgX++){
          let weights = 0, gxr = 0, gxg = 0, gxb = 0, gxa = 0;
          let gx = [0.0,0.0,0.0,0.0];
          let newImageIndex = (newImgX + newImgY * newImageData.width) | 0;
          let centerY = (newImgY + 0.5) * ratio;
          for(let oldImgY = (newImgY * ratio) | 0; oldImgY < (newImgY + 1) * ratio; oldImgY++){
            let centerX = (newImgX + 0.5) * ratio;
            let w0 = this._getW(centerY, oldImgY, halfRatio);
            for(let oldImgX = (newImgX * ratio) | 0; oldImgX < (newImgX + 1) * ratio; oldImgX++){
              let w = Math.sqrt(w0 + this._getW(centerX, oldImgX, halfRatio));
              if(w >= -1 && w <= 1){
                //hermite filter
                var weight = 2 * Math.pow(w, 3) - 3 * Math.pow(w, 2) + 1;
                if(weight > 0){
                  let dx = oldImgX + oldImgY * imageData.width;
                  this._bitPacker.unpackPixel(uInt32Array[dx]).forEach((color, index)=>{
                    gx[index] += (weight * color) | 0;
                  });
                  weights += weight;
                }
              }
            }
            newUInt32Array[newImageIndex] = this._bitPacker.packPixel(... gx.map((gx, index)=>{
              return (gx / weights) | 0;
            }));
          }
        }
      }
      resolve(newImageData);
    });
  }

  _writeImageData(canvas, imageData) {
    canvas.height = imageData.height;
    canvas.width = imageData.width;
    var context = canvas.getContext('2d');
    context.putImageData(this._convertToRealImageData(imageData), 0, 0);
    return context;
  }

  _convertToRealImageData(pImageData) {
    let realImageData = document.createElement('canvas')
      .getContext('2d')
      .createImageData(pImageData.width, pImageData.height);

    realImageData.data.set(pImageData.data);
    return realImageData;
  }



  _getW(center, coord, halfRatio){
    return Math.pow(Math.abs(center - (coord + 0.5)) / halfRatio, 2);
  }


}
