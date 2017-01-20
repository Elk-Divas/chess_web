Canadarm.init({
  onError: true,  // Set to false if you do not want window.onerror set.
  wrapEvents: true, // Set to false if you do not want all event handlers to be logged for errors
  logLevel: Canadarm.level.WARN, // Will only send logs for level of WARN and above.
  appenders: [
    Canadarm.Appender.standardLogAppender
  ],
  handlers: [
    Canadarm.Handler.beaconLogHandler('http://127.0.0.1:8000/log.php'),
    Canadarm.Handler.consoleLogHandler
  ]
});

