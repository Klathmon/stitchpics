if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope){
  importScripts('../../babel-polyfill.js');
}
