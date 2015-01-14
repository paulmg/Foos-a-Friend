// variables //
var currentState = 'register';
var registrationId, name, email;

console.log(currentState);

// methods //
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
        }

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

function registerFaF(tabs) {
  console.log(tabs);
   chrome.tabs.sendMessage(tabs[0].id, {method: 'openRegister'}, function(response) {
    if (chrome.runtime.lastError) {
      // An error occurred :(
      console.log("ERROR: ", chrome.runtime.lastError);
    } else {
      console.log(response);
    }
  });
}

function openFaF(tabs) {
  // maybe do lookup of users and send it as array before opening
  // if not then ajax in users in content script
  chrome.tabs.sendMessage(tabs[0].id, {method: 'openApp', name: name}, function(response) {
    if (chrome.runtime.lastError) {
      // An error occurred :(
      console.log("ERROR: ", chrome.runtime.lastError);
    } else {
      // Do something useful with the HTML content
      console.log(response);
    }
  });
}


function firstTimeRegistration() {
  chrome.storage.local.get("registered", function(result) {
    // If already registered, bail out.
    if (result["registered"])
      return;

    console.log('register');
    register();
  });
}

function register() {
  var senderId = '35518340190';
  chrome.gcm.register([senderId], registerCallback);
}

function registerCallback(regId) {
  registrationId = regId;

  console.log('registerCallback', regId);

  if (chrome.runtime.lastError) {
    // When the registration fails, handle the error and retry the
    // registration later.
    console.log("Registration failed: " + chrome.runtime.lastError.message);
    return;
  } else {
    //todo: set it to btn click instead
    setTimeout(function() {

  }, 5000);
  }
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
  chrome.notifications.create(getNotificationId(), {
    title: 'GCM Message',
    //iconUrl: 'gcm_128.png',
    type: 'basic',
    message: messageString
  }, function() {});
}
// Returns a new notification ID used in the notification.
function getNotificationId() {
  var id = Math.floor(Math.random() * 9007199254740992) + 1;
  return id.toString();
}

firstTimeRegistration();

// listeners //
// click //
chrome.browserAction.onClicked.addListener(clickMsgToContent);

// Set up listeners to trigger the first time registration.
//chrome.runtime.onInstalled.addListener(firstTimeRegistration);
//chrome.runtime.onStartup.addListener(firstTimeRegistration);

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.method ) {
      switch(request.method) {
        case 'registerUser':
          name = request.name;
          email = request.email;

          registerUser();

          break;
        case 'getAllUsers':

          getAllusers();

          break;
      }
    }
  }
);

function registerUser() {
  console.log('registeringUser');
  var data = {regId: registrationId, name: name, email: email};
  $.post('http://stormy-brushlands-5186.herokuapp.com/registerUser.php', data, function() {

  })
  .done(function(response) {
    console.log(response);
    // Mark that the first-time registration is done.
    chrome.storage.local.set({registered: true});
    console.log('registered', registrationId);

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      openFaF(tabs);
    });

    currentState = 'close';
  })
  .fail(function() {

  });
}

// Set up a listener for GCM message event.
chrome.gcm.onMessage.addListener(messageReceived);


//example of using a message handler from the inject scripts
// chrome.extension.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     //chrome.pageAction.show(sender.tab.id);
//     sendResponse();
//   }
// );
