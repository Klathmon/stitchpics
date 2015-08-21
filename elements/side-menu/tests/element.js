/*jshint expr: true*/
suite('Element Tests', ()=> {
  'use strict';
  let element;

  setup(()=> element = fixture('basic'));

  test('Menu has height', ()=> {
    expect(element.querySelector('paper-menu').offsetHeight).to.be.above(10);
  });

  test('AdContainer has height', ()=> {
    expect(element.querySelector('.adContainer').offsetHeight).to.be.above(10);
  });

  test('SocialButtons has height', ()=> {
    expect(element.querySelector('.socialButtons').offsetHeight).to.be.above(10);
  });

  test('SocialButtons has multiple children buttons', (done)=> {
    setTimeout(()=>{
      expect(element.querySelectorAll('.socialButtons paper-button').length).to.be.above(1);
      done();
    }, 100);
  });


});
