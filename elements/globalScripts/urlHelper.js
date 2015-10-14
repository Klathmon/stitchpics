class UrlHelper {

  /**
   * This is a bit of black magic...
   * This will unpack an int (like 3) into it's binary parts (like [true, true]).
   * Then it will return the reversed form of that array (so that the same options are always
   * at the front even if new ones are added later)
   */
  unpackOptions(packedOptions){
    let options = (packedOptions >>> 0).toString(2).split('').map((value)=>!!(value*1)).reverse(); // jshint ignore:line

    return {
      useDmcColors: options[0],
      hideTheGrid: options[1],
      highQualityMode: options[2]
    };
  }

  /**
   * this is the sister function to unpackOptions, it will re-pack the options into an int
   */
  packOptions(optionsObj){
    let options = [
      optionsObj.useDmcColors,
      optionsObj.hideTheGrid,
      optionsObj.highQualityMode
    ];

    return parseInt(options.map((value)=>value*1).reverse().join(''),2);
  }

  getImageDataFromHash(hash){
    return new Promise((resolve ,reject)=>{
      let img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = function(){
        var canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;

        var context = canvas.getContext("2d");
        context.drawImage(this, 0, 0);
        resolve(context.getImageData(0, 0, canvas.width, canvas.height));
      };
      img.src = `//i.imgur.com/${hash}.jpg`;
    });

  }

  // #!/app/:imageHash?/:clothCount?/:size?/:colors?/:packedOptions?
  buildUrl(imageHash, clothCount = 14, size = 6, colors = 12, packedOptions = 0){
    return `${window.location.origin}#!/app/${imageHash}/${clothCount}/${size}/${colors}/${packedOptions}`;
  }
}
