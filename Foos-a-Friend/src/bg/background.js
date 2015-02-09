// variables //
var currentState = 'register';
var registrationId, firstName, lastName, nickName, email, avatar, userId, myNotificationID;

var appId = '35518340190';
var dbServer = 'http://stormy-brushlands-5186.herokuapp.com/';

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

function registerFaF(tabs) {
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
  //console.log(userId)

  console.log('test')
  // check for user id
  checkUserId();

  getAllUsers(sendOpenMessage, tabs);
}

function checkUserId() {
  // todo: get the userId from db it storage is empty as well
  if (typeof(userId) == 'undefined' || userId == '') {
    chrome.storage.local.get('userId', function(result) {
      console.log(result);
      if(result['userId'])
        userId = result['userId'];
    })
  }
}

function getAllUsers(callback, tabs) {
  console.log('getting all users');

  $.get(dbServer + 'getAllUsers.php')
    .done(function(response) {
      console.log(response);

      callback(tabs, response);

      // currentState = 'close';
    })
    .fail(function(xhr, textStatus, errorThrown) {
      console.log('did not get all users', xhr.responseText, textStatus, errorThrown)
    });
}

function sendOpenMessage(tabs, users) {
  chrome.tabs.sendMessage(tabs[0].id, {method: 'openApp', users: users}, function(response) {
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
  var senderId = appId; //google app id
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

// todo: should switch to calling only on onInstalled?
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
          firstName = request.firstName;
          lastName = request.lastName;
          nickName = request.nickName;
          email = request.email;

          registerUser();

          break;
        case 'getAllUsers':
          getAllusers();

          break;
        case 'inviteUser':
          inviteUser(request.email, request.regId);

          break;
        case 'addPlayer':
          console.log(request.userId);
          addPlayer(request.userId);

          break;
      }
    }
  }
);

function registerUser() {
  console.log('registeringUser');
  var data = {regId: registrationId, firstName: firstName, lastName: lastName, nickName: nickName, email: email};
  $.post(dbServer + 'registerUser.php', data, function() {})
    .done(function(response) {
      console.log(response);
      userId = response.userId;
      // Mark that the first-time registration is done, set user id
      chrome.storage.local.set({registered: true, userId: userId});
      console.log('registered', registrationId);

      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        openFaF(tabs);
      });

      currentState = 'close';
    })
    .fail(function(xhr, textStatus, errorThrown) {
      console.log('failed to post to heroku register user', xhr.responseText, textStatus, errorThrown);
    });
}

function inviteUser(email, regId) {
  console.log('invitingUser');
  var data = {regId: regId, email: email};
    $.post(dbServer + 'inviteUser.php', data, function() {})
    .done(function(response) {
      console.log(response);

    })
    .fail(function(xhr, textStatus, errorThrown) {
      console.log('failed to post to heroku invite user', xhr.responseText, textStatus, errorThrown);
    });
}

function addPlayer(userId) {
  console.log('addingUser');
  var data = {userId: userId};
  $.post(dbServer + 'addPlayer.php', data, function() {})
    .done(function(response) {
      console.log(response);

    })
    .fail(function(xhr, textStatus, errorThrown) {
      console.log('failed to post to heroku invite user', xhr.responseText, textStatus, errorThrown);
    });
}


// Set up a listener for GCM message event.
chrome.gcm.onMessage.addListener(messageReceived);
