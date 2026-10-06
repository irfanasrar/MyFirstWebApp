/**
 * Contact form validation and Advice Slip fetch for the Bootstrap rebuild.
 * Bootstrap's JS bundle only handles the navbar collapse; all behaviour here
 * is our own.
 */
(function () {
  'use strict';

  /* ---------- Contact / feedback form ---------- */

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

    var fieldMap = {
      name: { input: nameInput, errorId: 'visitor-name-error' },
      email: { input: emailInput, errorId: 'visitor-email-error' },
      topic: { input: topicInput, errorId: 'topic-error' }
    };

    /** Clear Bootstrap validation state on one field. */
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

    /** Mark a field invalid with visible text (not colour alone). */
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

    function topicLabel(value) {
      var labels = {
        coursework: 'a coursework question',
        feedback: 'page feedback',
        accessibility: 'accessibility',
        other: 'another topic'
      };
      return labels[value] || 'your message';
    }

    // Same rules as the original site: name required, email must include @, topic required.
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

    if (toggleTip && tip) {
      toggleTip.addEventListener('click', function () {
        var hidden = tip.classList.toggle('d-none');
        toggleTip.textContent = hidden ? 'Show tip' : 'Hide tip';
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();

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

      // Short confirmation after a valid submission (same personalisation ideas as before).
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

  /* ---------- Advice Slip random tip ---------- */

  var button = document.getElementById('get-advice');
  var statusEl = document.getElementById('advice-status');
  var resultEl = document.getElementById('advice-result');

  if (button && statusEl && resultEl) {
    var ADVICE_URL = 'https://api.adviceslip.com/advice';

    function setLoading(isLoading) {
      button.disabled = isLoading;
      if (isLoading) {
        // Visible loading state: spinner + text, button disabled.
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
        // cache: 'no-store' plus a cache-busting query so repeat clicks can get a new tip
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
        resultEl.textContent = '';
        // Clear, readable text error if the request fails (network or bad response).
        showStatus('Could not load a tip. Check your connection and try again.', true);
        console.error('Advice Slip fetch failed:', err);
      } finally {
        setLoading(false);
      }
    }

    button.addEventListener('click', fetchAdvice);
  }
})();
