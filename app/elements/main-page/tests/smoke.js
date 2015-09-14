/*jshint expr: true*/
suite('Smoke Tests', ()=> {
  'use strict';
  let element;

  setup(()=> element = fixture('basic'));

  test('Element Name Correct', ()=> {
    expect(element.tagName).to.equal(element.is.toUpperCase());
  });

});
