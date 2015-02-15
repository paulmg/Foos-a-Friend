function log() {
  console.log.apply(console, arguments);
}

module.exports.create = function(context) {
  return {

  };
};

// for suppressing console.log output in unit tests:
module.exports.__resetLog = function() { log = function() {}; };
