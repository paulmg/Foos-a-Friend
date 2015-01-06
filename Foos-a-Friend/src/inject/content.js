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
    $('body').append('<div id="foosafy" class="foosafy">\
      <h1>Foos a Friend</h1>\
      <section class="foosafy-pick">\
        <div class="foosafy-pick-row">\
          <div class="foosafy-pick-col"> 1 <img src="http://placehold.it/150x150" /></div>\
          <div class="foosafy-pick-col"> 2 <img src="http://placehold.it/150x150" /></div>\
        </div>\
        <div class="foosafy-pick-row">\
          <div class="foosafy-pick-col"><img src="http://placehold.it/150x150" /> 3</div>\
          <div class="foosafy-pick-col"><img src="http://placehold.it/150x150" /> 4</div>\
        </div>\
        <div style="clear:both;"></div>\
        <a id="clickRandom" class="foosafy-link-random" href="#">Pick Foosers at Random</a>\
        <p>or</p>\
        <p>Select Individual Players</p>\
      </section>\
      <section class="foosafy-individual">\
        <table>\
          <tr>\
            <td style="width: 20%;">\
              <img src="http://placehold.it/80x80" />\
            </td>\
            <td style="width: 40%;">\
              Douche Stain\
            </td>\
            <td style="width: 40%;">\
              <a class="foosafy-individual-add" href="#">ADD</a>\
              <a class="foosafy-individual-invite" href="#">INVITE</a>\
            </td>\
          </tr>\
          <tr>\
            <td style="width: 20%;">\
              <img src="http://placehold.it/80x80" />\
            </td>\
            <td style="width: 40%;">\
              Ass Nuggets\
            </td>\
            <td style="width: 40%;">\
              <a class="foosafy-individual-add" href="#">ADD</a>\
              <a class="foosafy-individual-invite" href="#">INVITE</a>\
            </td>\
          </tr>\
        </table>\
      </section>\
    </div>')

    .delay(100).promise().done(function() {
      $('#foosafy').addClass('open');
    });
    var html = 'testing this crap';
    sendResponse({ "htmlContent": html });
  } else if(request.method && (request.method == 'closeApp')) {
    $('#foosafy').removeClass('open').delay(400).promise().done(function() {
      $('#foosafy').remove();
    });
  } else if(request.method && (request.method == 'openRegister')) {
    $('body').append('<div id="foosafyRegister" class="foosafy foosafy-register">\
      <h1>Fill out yo Foos, Bitch</h1>\
      <section class="foosafy-fill">\
        Name\
        <br/><br/>\
        <input id="name" type="text" />\
        <br/><br/>\
        Email\
        <br/><br/>\
        <input id="email" type="text" />\
        <br/><br/>\
        <a id="submitRegister" href="#">Done with this shit</a>\
        <br/><br/>\
        <div id="status"></div>\
      </section>\
    </div>')

    .delay(100).promise().done(function() {
      $('#foosafyRegister').addClass('open');
      //sendResponse2 = sendResponse;
    });
  }
}

// clicks //
// first time register submission
$('body').on('click', '#submitRegister', function() {
  var nameVal = $('#name').val();
  var emailVal = $('#email').val();
  var status = $('#status');
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
});

// listeners //
chrome.runtime.onMessage.addListener(mainAppListener);
