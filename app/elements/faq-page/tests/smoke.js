suite('Smoke Tests', ()=> {
  'use strict';
  let element;

  setup(()=> element = fixture('basic'));

  test('Element Name Correct', ()=> {
    expect(element.tagName).to.equal(element.is.toUpperCase());
  });

  test('Element Has Layout', ()=> {
    let height = window.getComputedStyle(element).getPropertyValue('height');
    expect(height).to.equal('auto');
  });

});
