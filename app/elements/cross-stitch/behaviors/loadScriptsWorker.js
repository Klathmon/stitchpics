if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope){
  importScripts('../../globalScripts.js');
}
