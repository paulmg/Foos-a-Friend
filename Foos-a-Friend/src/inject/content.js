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
      var templateNode = document.querySelector('#openTemplate');
      var clone = document.importNode(templateNode.content, true);
      templateNode.remove();


      var randomBtn = clone.querySelector('#clickRandom');
      // btn arrays
      //var addBtn = ;
      //var inviteBtn = ;

      $(randomBtn).on('click', function(e) {
        e.preventDefault();
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
    console.log('testReg');
    var foosafy = $('<div id="foosafy"></div>');
    $('body').append(foosafy);

    var template = foosafy.load(chrome.extension.getURL('src/inject/registration.html'), function() {
      var host = document.querySelector('#foosafy');

      var shadow = host.createShadowRoot();
      var templateNode = document.querySelector('#registrationTemplate');
      var clone = document.importNode(templateNode.content, true);
      templateNode.remove();

      var submitBtn = clone.querySelector('#submitRegister');
      var nameInput = clone.querySelector('#nameInput');
      var emailInput = clone.querySelector('#emailInput');

      $(submitBtn).on('click', function(e) {
        e.preventDefault();

        var nameVal = $(nameInput).val();
        var emailVal = $(emailInput).val();

        if(typeof(nameVal) !== 'undefined' && nameVal !== '' && typeof(emailVal) !== 'undefined' && emailVal !== '') {
          chrome.storage.sync.set({
            email: emailVal,
            name: nameVal
          }, function() {
            // Update status to let user know options were saved.
            $('#foosafy').text('Options saved.');

            setTimeout(function() {
              chrome.runtime.sendMessage({ "method": "registerUser", "email": emailVal, "name": nameVal });

              $('#foosafy').removeClass('open').delay(400).promise().done(function() {
                $('#foosafy').remove();
              });
            }, 750);
          });
        } else { // info not there cause you're a dingbat
          $('#foosafy').text('Fill it out, shitlord.');
        }
      })

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
