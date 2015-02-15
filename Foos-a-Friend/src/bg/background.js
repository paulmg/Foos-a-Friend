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


function openFaF(tabs) {
  //console.log(userId)

  console.log('test')
  // check for user id
  checkUserId();

  getAllUsers(sendOpenMessage, tabs);
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



