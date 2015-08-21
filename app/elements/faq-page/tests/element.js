/*jshint expr: true*/
suite('Element Tests', ()=> {
  'use strict';
  let element;

  setup(()=> element = fixture('basic'));

  test('Element renders markdown', ()=> {
    expect(element.querySelectorAll('h2').length).to.be.above(3);
  });

  test('Element contains my-ad', ()=> {
    expect(element.querySelector('my-ad')).not.to.be.null;
  });

});
