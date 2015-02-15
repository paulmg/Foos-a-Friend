;(function() {

  console.log('BACKGROUND SCRIPT WORKS!');
  var mongoose = require('mongoose');
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
  var currentState = 'register';
  var firstName, lastName, nickName, email, avatar, userId, myNotificationID;

  console.log(currentState);

  function clickMsgToContent() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      console.log('click', currentState);

      switch(currentState) {
        case 'register':
          // stop register if options already filled out
          chrome.storage.local.get("registered", function(result) {
            // If already registered, bail out.
            if (result["registered"]) {
              openFaF(tabs);

              currentState = 'close';
            } else {
              registerFaF(tabs);
            }
          });

          break;
        case 'open':
          openFaF(tabs);

          currentState = 'close';

          break;
        case 'close':
          chrome.tabs.sendMessage(tabs[0].id, {method: 'closeApp'}, function(response) {});

          currentState = 'open';

          break;
        default:
          registerFaF(tabs);

          break;
      }
    });
  }

  function messageReceived(message) {
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
    checkUserId();
    console.log(userId); //undefined?
    var data = {userId: userId};


    $.post(dbServer + 'addPlayer.php', data, function() {})
      .done(function(response) {
        console.log(response);

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {method: 'acceptedInvite', users: users}, function(response) {
            if (chrome.runtime.lastError) {
              // An error occurred :(
              console.log("ERROR: ", chrome.runtime.lastError);
            } else {
              // Do something useful with the HTML content
              console.log(response);
            }
          });
        });
      })
      .fail(function(xhr, textStatus, errorThrown) {
        console.log('failed to post to heroku add user', xhr.responseText, textStatus, errorThrown);
      });
  }

// Handle the user's rejection
  function inviteDeclined() {
    checkUserId();

    var data = {};
    $.post(dbServer + 'inviteDeclined.php', data, function() {})
      .done(function(response) {
        console.log(response);
      })
      .fail(function(xhr, textStatus, errorThrown) {
        console.log('failed to post to heroku invite declined', xhr.responseText, textStatus, errorThrown);
      });
  }

  // listeners //
  // click //
  chrome.browserAction.onClicked.addListener(clickMsgToContent);

  // Set up a listener for GCM message event.
  chrome.gcm.onMessage.addListener(messageReceived);

  // Set up listeners to trigger the first time registration.
  chrome.runtime.onInstalled.addListener(register(config.appId));
  chrome.runtime.onStartup.addListener(register(config.appId));
})();
