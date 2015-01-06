// Saves options to chrome.storage
function save_options() {
  var email = document.getElementById('email').value;
  var name = document.getElementById('name').value;

  chrome.storage.sync.set({
    email: email,
    name: name
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
    name: 'name'
  }, function(items) {
    document.getElementById('email').value = items.email;
    document.getElementById('name').value = items.name;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
