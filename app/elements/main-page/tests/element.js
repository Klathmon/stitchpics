/*jshint expr: true*/
suite('Element Tests', ()=> {
  'use strict';
  let element;

  setup(()=> element = fixture('basic'));

  test('Sliders should not change default values', ()=> {
    //Had an issue where safari was doing this at one point...
    expect(element.clothCount).to.equal(14);
    expect(element.size).to.equal(6);
    expect(element.numColors).to.equal(12);
  });

  test('Auto-load from hash', (done)=> {
    autoUnhookListener(element, 'crossStitchDone', (event)=>{
      expect(event.detail.data).to.have.length.above(1000);
      done();
    });

    element.clothCount = 15;
    element.size = 5;
    element.numColors = 4;
    element.imageHash = 'fNQu7Vl';
  });

});


function autoUnhookListener(element, eventName, callback){
  element.addEventListener(eventName, (event)=>{
    event.target.removeEventListener(event.type, arguments.callee);
    return callback(event);
  });
}
