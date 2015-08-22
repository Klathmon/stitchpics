/*jshint expr: true*/
suite('Element Tests', ()=> {
  'use strict';
  let element;

  setup(()=> element = fixture('basic'));

  test('Crossstitch completes', (done)=> {
    autoUnhookListener(element, 'crossStitchDone', ()=> done());

    loadImage("grad5.png", (imageData)=> element.imagedata = imageData);
  });

  test('Correct palette generated', (done)=> {
    let expectedPalette = [[127,127,127],[239,228,176],[181,230,29],[200,191,231]];

    autoUnhookListener(element, 'crossStitchDone', ()=>{
      expect(element.palette).to.deep.have.members(expectedPalette);
      done();
    });
    loadImage("testPattern.png", (imageData)=> element.imagedata = imageData);
  });

  test('DMC colors used when required', (done)=> {
    element.usedmccolors=true;
    let expectedPalette = [[121,121,121],[255,231,182],[185,200,102],[190,193,205]];
    autoUnhookListener(element, 'crossStitchDone', ()=>{
      expect(element.palette).to.deep.have.members(expectedPalette);
      done();
    });
    loadImage("testPattern.png", (imageData)=> element.imagedata = imageData);
  });

  test('Correct number of colors created', (done)=> {
    autoUnhookListener(element, 'crossStitchDone', ()=>{
      expect(element.palette).to.have.length(12);
      done();
    });
    element.numcolors = 12;
    loadImage("grad5.png", (imageData)=> element.imagedata = imageData);
  });

});

function loadImage(src, callback){
  let img = new Image();
  img.onload = function(){
    let canvas = document.createElement('canvas');
    let context = canvas.getContext("2d");
    canvas.width = this.width;
    canvas.height = this.height;
    context.drawImage(this, 0, 0);
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    callback(imageData);
  };
  img.src = src;
}

function autoUnhookListener(element, eventName, callback){
  element.addEventListener(eventName, (event)=>{
    event.target.removeEventListener(event.type, arguments.callee);
    return callback(event);
  });
}
