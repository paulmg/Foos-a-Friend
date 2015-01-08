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


var sendResponse2;

// methods //
function mainAppListener(request, sender, sendResponse) {
  console.log(request);
  // create main app
  if(request.method && (request.method == 'openApp')) {
    var foosafy = $('<div id="foosafy"></div>');
    $('body').append(foosafy);

    var template = foosafy.load(chrome.extension.getURL('src/inject/open.html'), function() {
      var host = document.querySelector('#foosafy');

      var shadow = host.createShadowRoot();
      var templateNode = document.querySelector('#registrationTemplate');
      var clone = document.importNode(templateNode.content, true);
      $(shadow).append(clone).delay(100).promise().done(function() {
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
    console.log('testReg');
    var foosafy = $('<div id="foosafy"></div>');
    $('body').append(foosafy);
    var template = foosafy.load(chrome.extension.getURL('src/inject/registration.html'), function() {
      var host = document.querySelector('#foosafy');

      var shadow = host.createShadowRoot();
      var templateNode = document.querySelector('#registrationTemplate');
      var clone = document.importNode(templateNode.content, true);

      var submitBtn = $(clone.querySelector('#submitRegister'));



      console.log($(clone.querySelector('#submitRegister')));
      console.log(document.querySelector('#submitRegister'));
      console.log(chrome);

      $(shadow).append(clone).delay(100).promise().done(function() {
        $('#foosafy').addClass('open');
        console.log($('#submitRegister'));
        submitBtn.click(function(e) {
          e.preventDefault();

          var nameVal = $(clone.querySelector('#name')).val();
          var emailVal = $(clone.querySelector('#email')).val();
          var status = $(clone.querySelector('#status'));
          console.log(nameVal, emailVal);

          if(nameVal !== '' && emailVal !== '') {
            chrome.storage.sync.set({
              email: emailVal,
              name: nameVal
            }, function() {
              // Update status to let user know options were saved.
              status.text('Options saved.');
              setTimeout(function() {
                status.text('');

                chrome.runtime.sendMessage({ "method": "sendUserInfo", "email": emailVal, "name": nameVal });

                $('#foosafyRegister').removeClass('open').delay(400).promise().done(function() {
                  $('#foosafyRegister').remove();
                });
              }, 750);
            });
          } else { // info not there cause you're a dingbat
            status.text('fill out the fucking info you shitbag');
          }
        })
        //sendResponse2 = sendResponse;
      });
    });
  }
}

// listeners //
chrome.runtime.onMessage.addListener(mainAppListener);
