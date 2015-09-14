if (isInsideWorker()){
  importScripts('../globalScripts/globalScripts.js');
}
function isInsideWorker(){
  return (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope);
}
