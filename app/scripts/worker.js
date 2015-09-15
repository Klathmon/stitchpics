class Thread {
  constructor(url, numThreads){
    this.numThreads = numThreads;
    this.workingThreads = [];
    this.threadPool = _.times(numThreads, ()=>{
      return new Worker(url);
    });
  }

  run(func, data, transferrable = undefined){
    // At this point assume there is a worker available
    let worker = this.threadQueue
  }

  static oneTimeListener(element, eventName, callback){
    element.addEventListener(eventName, (event)=>{
      event.target.removeEventListener(event.type, arguments.callee);
      return callback(event);
    });
  }
}
