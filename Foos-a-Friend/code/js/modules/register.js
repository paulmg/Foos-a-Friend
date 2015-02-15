module.exports = function firstTimeRegistration(appId) {
  var regId;

  chrome.storage.local.get("registered", function (result) {
    // If already registered, bail out.
    if (result["registered"])
      return;

    console.log('register');
    chromeRegister();
  });

  function chromeRegister() {
    chrome.gcm.register([appId], registerCallback);
  }

  function registerCallback(regId) {

    console.log('registerCallback', regId);

    if (chrome.runtime.lastError) {
      // When the registration fails, handle the error and retry the
      // registration later.
      console.log("Registration failed: " + chrome.runtime.lastError.message);
    } else {
      chrome.storage.local.set({registered: true, regId: regId});
    }
  }
};