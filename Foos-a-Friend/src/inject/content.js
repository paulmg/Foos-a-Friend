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


var players;

// methods //
function mainAppListener(request, sender, sendResponse) {
  console.log(request);
  // create main app
  if(request.method && (request.method == 'openApp')) {
    console.log(request.users);

    var foosafy = $('<div id="foosafy"></div>');
    $('body').append(foosafy);

    foosafy.load(chrome.extension.getURL('src/inject/main.html'), function() {
      var host = document.querySelector('#foosafy');

      var shadow = host.createShadowRoot();
      var templateNode = document.querySelector('#openTemplate');
      var clone = document.importNode(templateNode.content, true);
      templateNode.remove();

      // player section
      var playersList = clone.querySelector('#foosafyPlayersList');
      players = playersList.querySelectorAll('.foosafy-pick-col');

      // user section
      var userList = clone.querySelector('#foosafyUserList');
      var users = $.parseJSON(request.users);
      $.each(users, function(key, value) {
        console.log(value);

        var user = '<tr> \
          <td style="width: 20%;"> \
            <img src="' + value.avatar + '" /> \
          </td> \
          <td style="width: 40%;"> \
            ' + value.firstName + ' "' + value.nickName + '" ' + value.lastName + ' \
          </td> \
          <td style="width: 40%;"> \
            <a id="foosafyAddUser" data-id="' + value.id + '" data-avatar="' + value.avatar + '" class="foosafy-individual-add"  href="#">ADD</a> \
            <a id="foosafyInviteUser" data-id="' + value.id + '" data-email="' + value.email + '" data-regid="' + value.regId + '" class="foosafy-individual-invite" href="#">INVITE</a> \
          </td> \
        </tr>';

        $(userList).append(user);
      });

      var randomBtn = clone.querySelector('#choseRandomBtn');
      $(randomBtn).on('click', function(e) {
        e.preventDefault();

        // check how many players left, grab array of ids, send user invite per id

      });

      var closeBtn = clone.querySelector('#closeFoosafyBtn');
      $(closeBtn).on('click', function(e) {
        e.preventDefault();

        $('#foosafy').removeClass('open');
      });

      // btn arrays
      var addBtnArray = clone.querySelectorAll('.foosafy-individual-add');
      $(addBtnArray).each(function(key, value) {
        $(this).on('click', function(e) {
          e.preventDefault();

          console.log('test', $(this));
          // set user to playing
          var userId = $(this).data("id");
          console.log(userId);

          // todo: might be better to do this once match is started (on match start btn click)
          chrome.runtime.sendMessage({ "method": "addPlayer", "userId": userId });

          var playerAvatar = $(this).data("avatar") + "?s=150";
          // populate the top section depending on which player spot is open
          $(players).each(function(key, value) {
            if($(this).data('player') == '') {
              $(this).find('img').prop('src', playerAvatar).end().data('player', userId);
              $(this).append('<div class="kill-player">X</div>');
              // set close btn click event
              $(this).find('.kill-player').on('click', function() {
                // return to default
                $(this).parent().data('player', '').find('img').prop('src', 'http://placehold.it/150x150');
                $(this).remove();
              });

              return false;
            }
          });
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

      // end foreach btn arrays

      $(shadow).append(clone).promise().done(function() {
        // todo: not always opening. Set up pre-loader
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

    foosafy.load(chrome.extension.getURL('src/inject/registration.html'), function() {
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
  } else if(request.method && (request.method == 'acceptedInvite')) {
    console.log('adding Player');

    console.log(players);
  }
}

// listeners //
chrome.runtime.onMessage.addListener(mainAppListener);
