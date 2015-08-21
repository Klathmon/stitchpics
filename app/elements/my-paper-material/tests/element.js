/*jshint expr: true*/
suite('Element Tests', ()=> {
  'use strict';
  let element;

  setup(()=> element = fixture('basic'));

  test('Elevation is set', ()=> {
    expect(element.elevation).to.equal('4');
  });

  test('Elevation matches inner element', ()=> {
    let innerPaperMaterial = element.querySelector('paper-material');
    expect(element.elevation).to.equal(innerPaperMaterial.elevation);
  });

  test('Content matches expected', ()=> {
    let innerH1 = element.querySelector('h1');
    expect(innerH1.innerHTML).to.equal('This is test stuff!');
  });

});
