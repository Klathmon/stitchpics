suite('Element Tests', ()=> {
  'use strict';
  let element;

  setup(()=> element = fixture('mypapermaterial'));

  test('Elevation is set', ()=> {
    expect(element.elevation).to.equal('4');
  });

  test('Elevation matches inner element', ()=> {
    let innerPaperMaterial = element.querySelector('paper-material');
    expect(element.elevation).to.equal(innerPaperMaterial.elevation);
  });

});
