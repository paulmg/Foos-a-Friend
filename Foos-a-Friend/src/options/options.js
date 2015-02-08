// Saves options to chrome.storage
function save_options() {
  var email = document.getElementById('email').value;
  var avatar = document.getElementById('avatar').value;
  var firstName = document.getElementById('firstName').value;
  var lastName = document.getElementById('lastName').value;
  var nickName = document.getElementById('nickName').value;

  chrome.storage.sync.set({
    email: email,
    avatar: avatar,
    firstName: firstName,
    lastName: lastName,
    nickName: nickName
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';

    setTimeout(function() {
      status.textContent = '';
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
    document.getElementById('email').value = items.email;
    document.getElementById('avatar').value = items.avatar;
    document.getElementById('firstName').value = items.firstName;
    document.getElementById('lastName').value = items.lastName;
    document.getElementById('nickName').value = items.nickName;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
