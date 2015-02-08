/*jshint -W043 */

chrome.extension.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);

      // ----------------------------------------------------------
      // This part of the script triggers when page is done loading
      console.log("Hello. This message was sent from scripts/content.js");
      // ----------------------------------------------------------

    }
  }, 10);
});


var foo;

// methods //
function mainAppListener(request, sender, sendResponse) {
  console.log(request);
  // create main app
  if(request.method && (request.method == 'openApp')) {
    console.log(request.users);

    var foosafy = $('<div id="foosafy"></div>');
    $('body').append(foosafy);

    var template = foosafy.load(chrome.extension.getURL('src/inject/open.html'), function() {
      var host = document.querySelector('#foosafy');

      var shadow = host.createShadowRoot();
      var templateNode = document.querySelector('#openTemplate');
      var clone = document.importNode(templateNode.content, true);
      templateNode.remove();

      var userList = clone.querySelector('#foosafyUserList');
      console.log($(userList));

      var users = $.parseJSON(request.users);
      $.each(users, function(key, value) {
        console.log(value);

        var user = "<tr> \
          <td style='width: 20%;'> \
            <img src='" + value.avatar + "' /> \
          </td> \
          <td style='width: 40%;'> \
            " + value.firstName + " \"" + value.nickName + "\" " + value.lastName + " \
          </td> \
          <td style='width: 40%;'> \
            <a id='foosafyAddUser' class='foosafy-individual-add' href='#'>ADD</a> \
            <a id='foosafyInviteUser' data-id='" + value._id.$id + "' data-email='" + value.email + "' data-regid='" + value.regId + "' class='foosafy-individual-invite' href='#'>INVITE</a> \
          </td> \
        </tr>";

        $(userList).append(user);
      });

      var randomBtn = clone.querySelector('#clickRandom');
      $(randomBtn).on('click', function(e) {
        e.preventDefault();
      });

      // btn arrays
      var addBtnArray = clone.querySelectorAll('.foosafy-individual-add');
      $(addBtnArray).each(function(key, value) {
        $(this).on('click', function(e) {
          e.preventDefault();

          console.log('test', $(this));
          // send player to game collection user array
          var playerId = $(this).data("id");
          chrome.runtime.sendMessage({ "method": "addUser", "id": playerId });

          // populate the top section depending on which player spot is open

        });
      });

      var inviteBtnArray = clone.querySelectorAll('.foosafy-individual-invite');
      $(inviteBtnArray).each(function(key, value) {
        $(this).on('click', function(e) {
          e.preventDefault();

          var emailVal = $(this).data("email");
          var regIdVal = $(this).data("regid");

          console.log(regIdVal)

          chrome.runtime.sendMessage({ "method": "inviteUser", "email": emailVal, "regId": regIdVal });

          // create invite sent

          console.log('test', $(this))
        });
      });

      // foreach btn arrays

      $(shadow).append(clone).promise().done(function() {
        $('#foosafy').addClass('open');
        //sendResponse2 = sendResponse;
      });

      var html = 'testing this crap';
      sendResponse({ "htmlContent": html });
    });
  } else if(request.method && (request.method == 'closeApp')) {
    $('#foosafy').removeClass('open').delay(400).promise().done(function() {
      $('#foosafy').remove();
    });
  } else if(request.method && (request.method == 'openRegister')) {
    var foosafy = $('<div id="foosafy"></div>');
    $('body').append(foosafy);

    var template = foosafy.load(chrome.extension.getURL('src/inject/registration.html'), function() {
      var host = document.querySelector('#foosafy');

      var shadow = host.createShadowRoot();
      var templateNode = document.querySelector('#registrationTemplate');
      var clone = document.importNode(templateNode.content, true);
      templateNode.remove();

      var submitBtn = clone.querySelector('#submitRegister');
      var firstNameInput = clone.querySelector('#firstNameInput');
      var lastNameInput = clone.querySelector('#lastNameInput');
      var nickNameInput = clone.querySelector('#nickNameInput');
      var emailInput = clone.querySelector('#emailInput');

      $(submitBtn).on('click', function(e) {
        e.preventDefault();

        var firstNameVal = $(firstNameInput).val();
        var lastNameVal = $(lastNameInput).val();
        var nickNameVal = $(nickNameInput).val();
        var emailVal = $(emailInput).val();

        if(typeof(firstNameVal) !== 'undefined' && firstNameVal !== '' &&
          typeof(lastNameVal) !== 'undefined' && lastNameVal !== '' &&
          typeof(nickNameVal) !== 'undefined' && nickNameVal !== '' &&
          typeof(emailVal) !== 'undefined' && emailVal !== '') {
          chrome.storage.sync.set({
            email: emailVal,
            firstName: firstNameVal,
            lastName: lastNameVal,
            nickName: nickNameVal
          }, function() {
            // Update status to let user know options were saved.
            $('#foosafy').text('Options saved.');

            setTimeout(function() {
              chrome.runtime.sendMessage({ "method": "registerUser", "email": emailVal, "firstName": firstNameVal, "lastName": lastNameVal, "nickName": nickNameVal });

              $('#foosafy').removeClass('open').delay(400).promise().done(function() {
                $('#foosafy').remove();
              });
            }, 750);
          });
        } else { // info not there cause you're a dingbat
          $('#foosafy').text('Fill it out, shitlord.');
        }
      });

      $(shadow).append(clone).delay(100).promise().done(function() {
        $('#foosafy').addClass('open');
        console.log($('#submitRegister'));

        //sendResponse2 = sendResponse;
      });
    });
  }
}

// listeners //
chrome.runtime.onMessage.addListener(mainAppListener);
