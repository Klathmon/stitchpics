class Sizor {

  /**
   * Creates the object
   */
  constructor(){
    this._bitPacker = new BitPacker();
  }

  scale(imageData, newImageData){
    return new Promise((resolve, reject)=>{
      let ratio = imageData.width / newImageData.width;
      let halfRatio = Math.ceil(ratio / 2);

      let uInt32Array = new Uint32Array(imageData.data.buffer);
      let newUInt32Array = new Uint32Array(newImageData.data.buffer);

      for(let newImgY = 0; newImgY < newImageData.height; newImgY++){
        for(let newImgX = 0; newImgX < newImageData.width; newImgX++){
          let weight = 0, weights = 0, gxr = 0, gxg = 0, gxb = 0, gxa = 0;
          let x2 = newImgX + newImgY * newImageData.width;
          let centerY = (newImgY + 0.5) * ratio;
          for(let oldImgY = (newImgY * ratio) | 0; oldImgY < (newImgY + 1) * ratio; oldImgY++){
            let dy = Math.abs(centerY - (oldImgY + 0.5)) / halfRatio;
            let centerX = (newImgX + 0.5) * ratio;
            let w0 = dy * dy;
            for(let oldImgX = (newImgX * ratio) | 0; oldImgX < (newImgX + 1) * ratio; oldImgX++){
              let dx = Math.abs(centerX - (oldImgX + 0.5)) / halfRatio;
              let w = Math.sqrt(w0 + dx * dx);
              if(w >= -1 && w <= 1){
                //hermite filter
                weight = 2 * Math.pow(w, 3) - 3 * Math.pow(w, 2) + 1;
                if(weight > 0){
                  dx = oldImgX + oldImgY * imageData.width;
                  let [r,g,b,a] = this._bitPacker.unpackPixel(uInt32Array[dx]);

                  gxr += (weight * r) | 0;
                  gxg += (weight * g) | 0;
                  gxb += (weight * b) | 0;
                  gxa += (weight * a) | 0;
                  weights += weight;
                }
              }
            }
            newUInt32Array[x2] = this._bitPacker.packPixel(
              (gxr / weights) | 0,
              (gxg / weights) | 0,
              (gxb / weights) | 0,
              (gxa / weights) | 0
            );
          }
        }
      }
      resolve(newImageData);
    });
  }
}
