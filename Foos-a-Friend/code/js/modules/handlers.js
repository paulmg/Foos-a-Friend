// create handler module for given `context`.
// handles `random`, `randomAsync`, and `echo` commands.
// both `random` function log the invocation information to console and return
// random number 0 - 999. `randomAsync` returns the value with 15 second delay.
// `echo` function doesn't return anything, just logs the input parameter
// `what`.
var $ = require('../libs/jquery');

function log() {
  console.log.apply(console, arguments);
}

module.exports.create = function(context) {
  var config = require('./config');

  return {
    random: function(done) {
      log('---> ' + context + '::random() invoked');
      var r = Math.floor(1000 * Math.random());
      log('<--- returns: ' + r);
      done(r);
    },
    randomAsync: function(done) {
      log('---> ' + context + '::randomAsync() invoked (15 sec delay)');
      setTimeout(function() {
        var r = Math.floor(1000 * Math.random());
        log('<--- returns: ' + r);
        done(r);
      }, 15 * 1000);
    },
    echo: function(what, done) {
      log('---> ' + context + '::echo("' + what + '") invoked');
      log('<--- (no return value)');
      done();
    },
    registerUser: function(data, done) {
      console.log('registeringUser', data);

      $.post(config.server + '/registerUser.php', data, function() {})
        .done(function(response) {
          console.log(response);

          // Mark that the first-time registration is done, set user id
          chrome.storage.local.set({registered: true, userId: response.userId, currentState: 'close'});

          //chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          //  openMain();
          //});
        })
        .fail(function(xhr, textStatus, errorThrown) {
          console.log('failed to post to heroku register user', xhr.responseText, textStatus, errorThrown);
        });

      done();
    },
    inviteUser: function(data, done) {
      console.log(data)
      console.log('invitingUser');

      $.post(config.server + '/inviteUser.php', data, function() {})
        .done(function(response) {
          console.log(response);

          if(response.failure != 0) {
            console.log('gcm message invite failure');
            //msg.cmd(['ct'], 'inviteFailed', function(){});
          }
        })
        .fail(function(xhr, textStatus, errorThrown) {
          console.log('failed to post to heroku invite user', xhr.responseText, textStatus, errorThrown);
        });

      done();
    },
    addPlayer: function(userId, done) {
      console.log(userId);
      var data = {userId: userId};
      $.post(config.server + '/addPlayer.php', data, function() {})
        .done(function(response) {
          console.log(response);
        })
        .fail(function(xhr, textStatus, errorThrown) {
          console.log('failed to post to heroku invite user', xhr.responseText, textStatus, errorThrown);
        });

      done();
    }
  };
};

// for suppressing console.log output in unit tests:
module.exports.__resetLog = function() { log = function() {}; };
