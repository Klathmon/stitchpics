/*jshint expr: true*/
suite('Element Tests', ()=> {
  'use strict';
  let element;

  setup(()=> {
    element = fixture('basic');
    element.palette=[
      [0, 127, 0],
      [255, 255, 255],
      [0, 0, 0]
    ];
  });

  test('Palette is displayed', (done)=> {
    setTimeout(()=>{
      expect(element.querySelectorAll('#paletteTable tr .swatch')).to.have.length(3);
      done();
    }, 1);
  });

  test('Colors convert to hex correctly', (done)=> {
    setTimeout(()=>{
      element.colors.forEach((color)=>{
        expect(color.hex).to.have.length(7);
      });
      done();
    }, 1);
  });

  test('Colors have human readable versions', (done)=> {
    setTimeout(()=>{
      element.colors.forEach((color)=>{
        expect(color.colorName).not.to.include('Invalid Color');
      });
      done();
    }, 1);
  });

  test('DMC colors are set if they exist', (done)=> {
    setTimeout(()=>{
      let numberThatHaveDMCColors = element.colors.reduce((previousValue, color)=>{
        console.log(color);
        if(typeof color.dmcColor === 'undefined'){
          return previousValue;
        }else{
          return ++previousValue;
        }
      }, 0);
      expect(numberThatHaveDMCColors).to.equal(2);
      done();
    }, 1);
  });

  test('Background colors are set', (done)=> {
    setTimeout(()=>{
      [...element.querySelectorAll('#paletteTable tr .swatch')].forEach((element)=>{
        expect(element.style['background-color']).not.to.be.null;
      });
      done();
    }, 1);
  });
});
