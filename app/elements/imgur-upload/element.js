(function() {
  'use strict';
  /*jshint -W064 */
  Polymer({
  /*jshint +W064 */
    is: 'imgur-upload',

    properties: {
      uploadEndpoint: {
        type: String,
        value: 'https://api.imgur.com/3/image.json'
      },
      clientId: {
        type: String,
        value: '12a81bf09a70960'
      },
      imagedata: {
        type: Array
      },
    },

    uploadImage(){
      fetch(this.uploadEndpoint, {
        method: 'post',
        mode: 'cors',
        headers: {
          "Authorization": 'Client-ID ' + this.clientId,
          "Accept": 'application/json',
          "Content-type": 'application/json; charset=UTF-8'
        },
        body: JSON.stringify({
          image: this.getBase64FromImageData(this.imagedata).replace(/.*,/, ''),
          type: 'base64'
        })
      }).then((r)=> r.json())
      .then((data)=>{
        console.log(data);
        this.$.shareInput.value = window.location.origin + '/' + data.data.id;
        this.$.saveDialog.open();
      }).catch((err)=>{
        console.log(err);
      });
    },

    getBase64FromImageData(imageData){
      var canvas = document.createElement('canvas');
      canvas.height = imageData.height;
      canvas.width = imageData.width;
      var context = canvas.getContext('2d');
      context.putImageData(imageData, 0, 0);
      return canvas.toDataURL();
    }
  });
})();
