do ->
  # prepare base perf object
  if typeof self.performance=='undefined'
    self.performance = {}
  if not self.performance.now
    nowOffset = +new Date()
    if performance.timing and performance.timing
      nowOffset = performance.timing.navigationStart
    self.performance.now = ->
      now = +new Date()
      return now - nowOffset
