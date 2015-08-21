suite('Smoke Tests', ()=> {
  'use strict';
  let element;

  setup(()=> element = fixture('basic'));

  test('Element Name Correct', ()=> {
    expect(element.tagName).to.equal(element.is.toUpperCase());
  });

  test('Element Has Layout', ()=> {
    expect(element.offsetHeight).to.be.above(10);
  });

});
