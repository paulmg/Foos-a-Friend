var $ = require('../libs/jquery');
var msg = require('./msg').init('ct-handlers');

function log() {
  console.log.apply(console, arguments);
}

module.exports.create = function(context) {
  var inviteBtn;

  return {
    openRegistration: function(regId, done) {
      var data = {};
      var foosafy = $('<div id="foosafy"></div>');
      $('body').append(foosafy);

      foosafy.load(chrome.extension.getURL('html/registration.html'), function() {
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
                data = { "regId": regId, "email": emailVal, "firstName": firstNameVal, "lastName": lastNameVal, "nickName": nickNameVal };
                //chrome.runtime.sendMessage({ "method": "registerUser", "email": emailVal, "firstName": firstNameVal, "lastName": lastNameVal, "nickName": nickNameVal });
                msg.bg('registerUser', data, function() {});

                foosafy.removeClass('open').delay(400).promise().done(function() {
                  foosafy.remove();
                });
              }, 750);
            });
          } else { // info not there cause you're a dingbat
            $('#foosafy').text('Fill it out, shitlord.');
          }
        });

        $(shadow).append(clone).delay(100).promise().done(function() {
          foosafy.addClass('open');
        });
      });

      done('register open');
    },
    openMain: function(response, done) {
      log('opening Main');
      log(response);

      //todo: check the main

      var foosafy = $('<div id="foosafy"></div>');
      $('body').append(foosafy);

      foosafy.load(chrome.extension.getURL('html/main.html'), function() {
        var host = document.querySelector('#foosafy');

        var shadow = host.createShadowRoot();
        var templateNode = document.querySelector('#openTemplate');
        var clone = document.importNode(templateNode.content, true);
        templateNode.remove();

        // player section
        var playersList = clone.querySelector('#foosafyPlayersList');
        var players = playersList.querySelectorAll('.foosafy-pick-col');

        // user section
        var userList = clone.querySelector('#foosafyUserList');
        var users = $.parseJSON(response);
        $.each(users, function(key, value) {
          log(value);

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

        var setMatchBtn = clone.querySelector('#setMatchBtn');
        var startMatchBtn = clone.querySelector('#startMatchBtn');
        var hidden = clone.querySelectorAll('#foosafyPlayersList, #foosafyIndividual');

        $(setMatchBtn).on('click', function(e) {
          e.preventDefault();

          //todo: load users now instead of before opening

          $(hidden).addClass('reveal');

          $(this).addClass('display-none');
        });

        $(startMatchBtn).on('click', function(e) {
          e.preventDefault();

          // check for 4 foosers
          var i = 0;
          $(players).each(function(key, value) {
            if($(this).data('player') == '') {
              i++;
            }
          });

          if(i == 4) {

          } else {
            //not enough players, tell them to stop being idiots
          }
          // set match to playing

          //
        });

        var randomBtn = clone.querySelector('#choseRandomBtn');
        $(randomBtn).on('click', function(e) {
          e.preventDefault();

          // check how many players left, grab array of ids, send user invite per id

        });

        var closeBtn = clone.querySelector('#closeFoosafyBtn');
        $(closeBtn).on('click', function(e) {
          e.preventDefault();

          killFoos();

          // todo: set this in bg handler
          chrome.storage.local.set({currentState: 'open'});
          chrome.storage.local.get(null, function(all){console.log(all)});
        });

        // btn arrays
        var addBtnArray = clone.querySelectorAll('.foosafy-individual-add');
        $(addBtnArray).each(function(key, value) {
          $(this).on('click', function(e) {
            e.preventDefault();

            console.log('test', $(this));
            // set user to playing
            var userId = $(this).data("id");
            log(userId);

            var playerAvatar = $(this).data("avatar") + "?s=150";
            // populate the top section depending on which player spot is open
            $(players).each(function(key, value) {
              if($(this).data('player') == '') {
                $(this).find('img').prop('src', playerAvatar).end().data('player', userId);
                $(this).append('<div class="kill-player">X</div>');
                // set close btn click event
                $(this).find('.kill-player').on('click', function() {
                  // return to default
                  $(this).parent().data('player', '').find('img').prop('src', '//placehold.it/150x150');
                  $(this).remove();
                });

                // todo: might be better to do this once match is started (on match start btn click)
                msg.bg('addPlayer', {"userId": userId});

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

            console.log(regIdVal);

            var data = {"email": emailVal, "regId": regIdVal};

            msg.bg('inviteUser', data, function(){});

            // create invite sent

            log('test', $(this))
          });
        });

        // end foreach btn arrays

        $(shadow).append(clone).promise().done(function() {
          // todo: not always opening. Set up pre-loader
          foosafy.addClass('open');
        });
      });

      done('main open');
    },
    closeMain: function(done) {
      killFoos();

      done('main close');
    },
    acceptedInvite: function(done) {

      done('accepted invite');
    },
    inviteFailed: function(done) {

      done('invite failed');
    }
  };
};

function killFoos() {
  $('#foosafy').removeClass('open').delay(400).promise().done(function() {
    $('#foosafy').remove();
  });
}

// for suppressing console.log output in unit tests:
module.exports.__resetLog = function() { log = function() {}; };
