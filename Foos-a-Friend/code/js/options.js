;(function() {
  console.log('OPTIONS SCRIPT WORKS!');

  var $ = require('./libs/jquery');
  var handlers = require('./modules/handlers').create('options');
  var msg = require('./modules/msg').init('options', handlers);
  var form = require('./modules/form');
  var runner = require('./modules/runner');

  form.init(runner.go.bind(runner, msg));

  // Saves options to chrome.storage
  function save_options() {
    var email = $('#email').val();
    var avatar = $('#avatar').val();
    var firstName = $('#firstName').val();
    var lastName = $('#lastName').val();
    var nickName = $('#nickName').val();

    chrome.storage.sync.set({
      email: email,
      avatar: avatar,
      firstName: firstName,
      lastName: lastName,
      nickName: nickName
    }, function() {
      // Update status to let user know options were saved.
      var status = $('#status');
      status.text('Options saved.');

      setTimeout(function() {
        status.text('');
      }, 750);
    });
  }

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
  function restore_options() {
    // Use default values
    chrome.storage.sync.get({
      email: 'email',
      avatar: 'avatar',
      firstName: 'firstName',
      lastName: 'lastName',
      nickName: 'nickName'
    }, function(items) {
      $('#email').val(items.email);
      $('#avatar').val(items.avatar);
      $('#firstName').val(items.firstName);
      $('#lastName').val(items.lastName);
      $('#nickName').val(items.nickName);
    });
  }

  document.addEventListener('DOMContentLoaded', restore_options);
  $('#save').on('click', save_options);
})();
