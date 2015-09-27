class ImageDataHelpers {
   static convertToRealImageData(pImageData) {
    let realImageData = document.createElement('canvas')
      .getContext('2d')
      .createImageData(pImageData.width, pImageData.height);

    realImageData.data.set(pImageData.data);
    return realImageData;
  }

  static convertToFakeImageData(imageData){
    return {
      data: imageData.data,
      height: imageData.height,
      width: imageData.width
    };
  }

  static readImageData(canvas) {
    var context = canvas.getContext('2d');
    return context.getImageData(0, 0, canvas.width, canvas.height);
  }

  static writeImageData(canvas, imageData) {
    canvas.height = imageData.height;
    canvas.width = imageData.width;
    var context = canvas.getContext('2d');
    context.putImageData(ImageDataHelpers.convertToRealImageData(imageData), 0, 0);
    return context;
  }
}
