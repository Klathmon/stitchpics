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


});
