/* jslint node: true */
/* global chrome: true */
'use strict';

;(function() {
  console.log('BACKGROUND SCRIPT WORKS!');
  chrome.storage.local.set({currentState: 'register'});

  var $ = require('./libs/jquery');

  // here we use SHARED message handlers, so all the contexts support the same
  // commands. in background, we extend the handlers with two special
  // notification hooks. but this is NOT typical messaging system usage, since
  // you usually want each context to handle different commands. for this you
  // don't need handlers factory as used below. simply create individual
  // `handlers` object for each context and pass it to msg.init() call. in case
  // you don't need the context to support any commands, but want the context to
  // cooperate with the rest of the extension via messaging system (you want to
  // know when new instance of given context is created / destroyed, or you want
  // to be able to issue command requests from this context), you may simply
  // omit the `handlers` parameter for good when invoking msg.init()
  var handlers = require('./modules/handlers').create('bg');

  // adding special background notification handlers onConnect / onDisconnect
  function logEvent(ev, context, tabId) {
    console.log(ev + ': context = ' + context + ', tabId = ' + tabId);
  }
  handlers.onConnect = logEvent.bind(null, 'onConnect');
  handlers.onDisconnect = logEvent.bind(null, 'onDisconnect');

  var msg = require('./modules/msg').init('bg', handlers);

  var register = require('./modules/register');
  var config = require('./modules/config');

  // variables //
  var userId, myNotificationID;

  function clickMsgToContent() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.storage.local.get(null, function(all){console.log(all)});

      var currentState = '';
      chrome.storage.local.get('currentState', function(result) {
        currentState = result['currentState'] ? result['currentState'] : 'register';

        switch(currentState) {
          case 'register':
            // stop register if options already filled out
            chrome.storage.local.get('registered', function(result) {
              // If already registered, bail out.
              if (result['registered']) {
                openMain();
              } else {
                openRegistration();
              }
            });

            break;
          case 'open':
            openMain();

            break;
          case 'close':
            closeMain();

            chrome.storage.local.set({currentState: 'open'});

            break;
          default:
            openRegistration();

            break;
        }
      });
    });
  }

  function openRegistration() {
    var regId = '';
    chrome.storage.local.get('regId', function(result) {

      regId = result['regId'] ? result['regId'] : '';

      msg.cmd(['ct'], 'openRegistration', regId, function(result){
        console.log(result);
      });
    });
  }

  function openMain() {
    console.log('openingMain');

    getAllUsers(sendOpenMessage);
  }

  function getAllUsers(callback) {
    console.log('getting all users');

    $.get(config.server + '/getAllUsers.php')
      .done(function(response) {
        console.log(response);

        callback(response);
      })
      .fail(function(xhr, textStatus, errorThrown) {
        console.log('did not get all users', xhr.responseText, textStatus, errorThrown)
      });
  }

  function sendOpenMessage(users) {
    console.log('sending open msg');
    msg.cmd(['ct'], 'openMain', users, function(result) {
      if(result == 'main open') {
        chrome.storage.local.set({currentState: 'close'});
      }
    });
  }

  function closeMain() {
    console.log('sending close msg');
    msg.cmd(['ct'], 'closeMain', function(result) {
      if(result == 'main close') {
        chrome.storage.local.set({currentState: 'open'});
      }
    });
  }


  function gcmMessageReceived(message) {
    // A message is an object with a data property that
    // consists of key-value pairs.

    // Concatenate all key-value pairs to form a display string.
    var messageString = "";
    for (var key in message.data) {
      if (messageString !== "")
        messageString += ", ";
      messageString += key + ":" + message.data[key];
    }
    console.log("Message received: " + messageString);

    // Pop up a notification to show the GCM message.
    chrome.notifications.create("", {
      title: 'Foos?',
      iconUrl: chrome.extension.getURL('icons/faf_128.png'),
      type: 'basic',
      priority: 2,
      buttons: [{
        title: "Yes, let's Foos"
      }, {
        title: "No, I'm lame"
      }],
      message: messageString
    },  function(id) {
      myNotificationID = id;
    });
  }

  /* Respond to the user's clicking one of the buttons */
  chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
    if (notifId === myNotificationID) {
      if (btnIdx === 0) {
        inviteAccepted();
      } else if (btnIdx === 1) {
        inviteDeclined();
      }
    }
  });

  /* Add this to also handle the user's clicking
   * the small 'x' on the top right corner */
  chrome.notifications.onClosed.addListener(function() {
    inviteDeclined();
  });

  function inviteAccepted() {
    chrome.storage.local.get('userId', function(result) {
      var userId = '';
      if (result['userId'])
        userId = result['userId'];

      var data = {userId: userId};

      $.post(config.server + '/addPlayer.php', data, function () {})
        .done(function (response) {
          console.log(response);

          msg.cmd(['ct'], 'acceptedInvite', function () {});
        })
        .fail(function (xhr, textStatus, errorThrown) {
          console.log('failed to post to heroku add user', xhr.responseText, textStatus, errorThrown);
        });
    });
  }

  // Handle the user's rejection
  function inviteDeclined() {
    chrome.storage.local.get('userId', function(result) {
      var userId = '';
      if (result['userId'])
        userId = result['userId'];

      var data = {userId: userId};
      $.post(config.server + '/inviteDeclined.php', data, function () {
      })
        .done(function (response) {
          console.log(response);
        })
        .fail(function (xhr, textStatus, errorThrown) {
          console.log('failed to post to heroku invite declined', xhr.responseText, textStatus, errorThrown);
        });
    });
  }


  // listeners //
  // click //
  chrome.browserAction.onClicked.addListener(clickMsgToContent);

  // Set up a listener for GCM message event.
  chrome.gcm.onMessage.addListener(gcmMessageReceived);

  // Set up listeners to trigger the first time registration.
  //chrome.runtime.onInstalled.addListener(register(config.appId));
  //chrome.runtime.onStartup.addListener(register(config.appId));

  register(config.appId);
})();
