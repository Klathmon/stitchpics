/*jshint expr: true*/
suite('Element Tests', ()=> {
  'use strict';
  let element;

  setup(()=> element = fixture('basic'));

  test('Element renders markdown', (done)=> {
    //Set a delay because marked-element doesn't give me an event/callback when it's
    //done rendering...
    setTimeout(()=>{
      expect(element.querySelectorAll('h2').length).to.be.above(3);
      done();
    }, 100);
  });

  test('Element contains my-ad', ()=> {
    expect(element.querySelector('my-ad')).not.to.be.null;
  });

});
