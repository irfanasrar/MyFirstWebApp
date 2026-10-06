// script.js - contact form checks + the random tip button
// Bootstrap's bundle only does the navbar toggle, everything below is mine.

(function () {
  'use strict';

  // ===== Contact form =====

  var form = document.getElementById('contact-form');
  var feedback = document.getElementById('form-feedback');
  var tip = document.getElementById('form-tip');
  var toggleTip = document.getElementById('toggle-tip');

  if (form && feedback) {
    var nameInput = document.getElementById('visitor-name');
    var emailInput = document.getElementById('visitor-email');
    var topicInput = document.getElementById('topic');
    var messageInput = document.getElementById('message');
    var updatesInput = document.getElementById('updates');

    // the three fields I actually validate, and where each error goes
    var fieldMap = {
      name: { input: nameInput, errorId: 'visitor-name-error' },
      email: { input: emailInput, errorId: 'visitor-email-error' },
      topic: { input: topicInput, errorId: 'topic-error' }
    };

    function clearFieldError(key) {
      var entry = fieldMap[key];
      if (!entry || !entry.input) {
        return;
      }
      entry.input.classList.remove('is-invalid');
      entry.input.removeAttribute('aria-invalid');
      var err = document.getElementById(entry.errorId);
      if (err) {
        err.textContent = '';
      }
    }

    // red border on its own isn't enough, so I always put a text message under the field too
    function setFieldError(key, message) {
      var entry = fieldMap[key];
      if (!entry || !entry.input) {
        return;
      }
      entry.input.classList.add('is-invalid');
      entry.input.setAttribute('aria-invalid', 'true');
      entry.input.setAttribute('aria-describedby', entry.errorId);
      var err = document.getElementById(entry.errorId);
      if (err) {
        err.textContent = message;
      }
    }

    function clearAllFieldErrors() {
      Object.keys(fieldMap).forEach(clearFieldError);
    }

    function showConfirmation(text) {
      feedback.textContent = text;
      feedback.classList.remove('d-none', 'alert-danger');
      feedback.classList.add('alert-success');
    }

    function hideConfirmation() {
      feedback.textContent = '';
      feedback.classList.add('d-none');
      feedback.classList.remove('alert-success', 'alert-danger');
    }

    // turns the select value into something that reads ok in a sentence
    function topicLabel(value) {
      var labels = {
        coursework: 'a coursework question',
        feedback: 'page feedback',
        accessibility: 'accessibility',
        other: 'another topic'
      };
      return labels[value] || 'your message';
    }

    // same rules as my first version: name required, email needs an @, topic required
    // returns the first bad field (or null if everything's fine)
    function validateForm() {
      clearAllFieldErrors();
      hideConfirmation();

      var name = nameInput ? nameInput.value.trim() : '';
      var email = emailInput ? emailInput.value.trim() : '';
      var topic = topicInput ? topicInput.value : '';
      var firstInvalid = null;

      if (!name) {
        setFieldError('name', 'Please enter your name before sending.');
        firstInvalid = firstInvalid || nameInput;
      }

      // check the email has an @ before we go any further
      if (!email || email.indexOf('@') === -1) {
        setFieldError('email', 'Please enter a valid email address (it should include @).');
        firstInvalid = firstInvalid || emailInput;
      }

      if (!topic) {
        setFieldError('topic', 'Please choose a topic from the list so I know how to reply.');
        firstInvalid = firstInvalid || topicInput;
      }

      return firstInvalid;
    }

    // little show/hide for the tip line under the form
    if (toggleTip && tip) {
      toggleTip.addEventListener('click', function () {
        var hidden = tip.classList.toggle('d-none');
        toggleTip.textContent = hidden ? 'Show tip' : 'Hide tip';
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault(); // no server, so don't let the page reload

      var firstInvalid = validateForm();
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      var name = nameInput.value.trim();
      var email = emailInput.value.trim();
      var topic = topicInput.value;
      var message = messageInput ? messageInput.value.trim() : '';
      var wantsUpdates = updatesInput ? updatesInput.checked : false;
      var pref = form.querySelector('input[name="contact_pref"]:checked');
      var contactPref = pref ? pref.value : 'email';

      // build up the thank-you message bit by bit depending on what they picked
      var parts = [];
      parts.push('Thanks, ' + name + '! I received your note about ' + topicLabel(topic) + '.');
      if (message) {
        parts.push('You wrote: "' + message + '"');
      }
      if (contactPref === 'email') {
        parts.push('I will reply to ' + email + ' by email.');
      } else {
        parts.push('You chose no reply, so I will not email you back.');
      }
      if (wantsUpdates) {
        parts.push('You also opted in to occasional learning tips.');
      }

      showConfirmation(parts.join(' '));
    });
  }

  // ===== Random tip (Advice Slip API) =====

  var button = document.getElementById('get-advice');
  var statusEl = document.getElementById('advice-status');
  var resultEl = document.getElementById('advice-result');

  if (button && statusEl && resultEl) {
    var ADVICE_URL = 'https://api.adviceslip.com/advice';

    function setLoading(isLoading) {
      button.disabled = isLoading;
      if (isLoading) {
        // spinner + some text so it's obvious something is happening
        statusEl.classList.remove('is-error');
        statusEl.innerHTML =
          '<span class="spinner-border spinner-border-sm text-primary me-2" role="status" aria-hidden="true"></span>' +
          '<span>Fetching a tip from Advice Slip…</span>';
        button.setAttribute('aria-busy', 'true');
      } else {
        button.removeAttribute('aria-busy');
      }
    }

    function showStatus(text, isError) {
      statusEl.textContent = text;
      if (isError) {
        statusEl.classList.add('is-error');
      } else {
        statusEl.classList.remove('is-error');
      }
    }

    async function fetchAdvice() {
      setLoading(true);
      resultEl.textContent = '';

      try {
        // the API kept giving me the same tip on repeat clicks,
        // so no-store + a timestamp on the url sorts that out
        var response = await fetch(ADVICE_URL + '?t=' + Date.now(), {
          method: 'GET',
          headers: { Accept: 'application/json' },
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }

        var data = await response.json();
        var advice = data && data.slip && data.slip.advice;

        if (!advice) {
          throw new Error('Unexpected API response');
        }

        resultEl.textContent = '"' + advice + '"';
        showStatus('Tip loaded successfully.', false);
      } catch (err) {
        // network down or weird response - either way show a proper text message
        resultEl.textContent = '';
        showStatus('Could not load a tip. Check your connection and try again.', true);
        console.error('Advice Slip fetch failed:', err);
      } finally {
        setLoading(false);
      }
    }

    button.addEventListener('click', fetchAdvice);
  }
})();
