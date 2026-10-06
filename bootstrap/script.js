// On a phone, close the open menu before jumping to a section.
// If the jump happens while the menu is still open, the heading ends up under the bar.
(function () {
  var nav = document.getElementById('main-nav');
  if (!nav || !window.bootstrap) {
    return;
  }

  nav.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (!nav.classList.contains('show')) {
        return;
      }

      var target = document.querySelector(link.getAttribute('href'));
      if (!target) {
        return;
      }

      event.preventDefault();
      var collapse = bootstrap.Collapse.getOrCreateInstance(nav, { toggle: false });
      nav.addEventListener('hidden.bs.collapse', function () {
        target.scrollIntoView({ block: 'start' });
      }, { once: true });
      collapse.hide();
    });
  });
})();

// Contact form checks. Same rules as the original page, with Bootstrap valid/invalid styles.
(function () {
  var form = document.getElementById('contact-form');
  var feedback = document.getElementById('form-feedback');
  var tip = document.getElementById('form-tip');
  var toggleTip = document.getElementById('toggle-tip');

  if (!form || !feedback) {
    return;
  }

  function showMessage(text, isError) {
    feedback.textContent = text;
    feedback.classList.remove('d-none', 'alert-success', 'alert-danger');
    feedback.classList.add(isError ? 'alert-danger' : 'alert-success');
  }

  function setFieldState(input, valid) {
    if (!input) {
      return;
    }
    input.classList.toggle('is-invalid', !valid);
    input.classList.toggle('is-valid', valid);
    input.setAttribute('aria-invalid', valid ? 'false' : 'true');
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

  if (toggleTip && tip) {
    toggleTip.addEventListener('click', function () {
      var hidden = tip.classList.toggle('d-none');
      toggleTip.textContent = hidden ? 'Show tip' : 'Hide tip';
      toggleTip.setAttribute('aria-expanded', hidden ? 'false' : 'true');
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var nameInput = document.getElementById('visitor-name');
    var emailInput = document.getElementById('visitor-email');
    var topicInput = document.getElementById('topic');
    var messageInput = document.getElementById('message');
    var updatesInput = document.getElementById('updates');
    var pref = form.querySelector('input[name="contact_pref"]:checked');

    var name = nameInput ? nameInput.value.trim() : '';
    var email = emailInput ? emailInput.value.trim() : '';
    var topic = topicInput ? topicInput.value : '';
    var message = messageInput ? messageInput.value.trim() : '';
    var wantsUpdates = updatesInput ? updatesInput.checked : false;
    var contactPref = pref ? pref.value : 'email';

    var nameOk = name.length > 0;
    var emailOk = email.indexOf('@') !== -1;
    var topicOk = topic.length > 0;

    setFieldState(nameInput, nameOk);
    setFieldState(emailInput, emailOk);
    setFieldState(topicInput, topicOk);

    if (!nameOk) {
      showMessage('Please enter your name before sending.', true);
      if (nameInput) {
        nameInput.focus();
      }
      return;
    }

    if (!emailOk) {
      showMessage('Please enter a valid email address (it should include @).', true);
      if (emailInput) {
        emailInput.focus();
      }
      return;
    }

    if (!topicOk) {
      showMessage('Please choose a topic from the list so I know how to reply.', true);
      if (topicInput) {
        topicInput.focus();
      }
      return;
    }

    var parts = [];
    parts.push('Thanks, ' + name + '! I received your note about ' + topicLabel(topic) + '.');

    if (message) {
      parts.push('You wrote: "' + message + '"');
    } else {
      parts.push('You left the message box empty — that is fine for a quick contact.');
    }

    if (contactPref === 'email') {
      parts.push('I will reply to ' + email + ' by email.');
    } else {
      parts.push('You chose no reply, so I will not email you back.');
    }

    if (wantsUpdates) {
      parts.push('You also opted in to occasional learning tips.');
    }

    parts.push('This response was created with JavaScript on the page (no server).');

    showMessage(parts.join(' '), false);
  });
})();

// Random learning tip from the Advice Slip API.
(function () {
  var button = document.getElementById('get-advice');
  var label = document.getElementById('advice-label');
  var spinner = document.getElementById('advice-spinner');
  var statusEl = document.getElementById('advice-status');
  var resultEl = document.getElementById('advice-result');

  if (!button || !statusEl || !resultEl) {
    return;
  }

  var ADVICE_URL = 'https://api.adviceslip.com/advice';

  function setLoading(isLoading) {
    button.disabled = isLoading;
    button.setAttribute('aria-busy', isLoading ? 'true' : 'false');
    if (label) {
      label.textContent = isLoading ? 'Loading…' : 'Get a tip';
    }
    if (spinner) {
      spinner.classList.toggle('d-none', !isLoading);
    }
  }

  function showStatus(text, kind) {
    statusEl.className = 'alert mb-0';
    if (kind === 'error') {
      statusEl.classList.add('alert-danger');
    } else if (kind === 'loading') {
      statusEl.classList.add('alert-info');
    } else {
      statusEl.classList.add('alert-success');
    }
    statusEl.textContent = text;
  }

  function showResult(text) {
    if (!text) {
      resultEl.textContent = '';
      resultEl.classList.add('d-none');
      return;
    }
    resultEl.textContent = '"' + text + '"';
    resultEl.classList.remove('d-none');
  }

  async function fetchAdvice() {
    setLoading(true);
    showStatus('Fetching a tip from Advice Slip…', 'loading');
    showResult('');

    try {
      // Cache-bust so each click can return a new tip
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

      showResult(advice);
      showStatus('Tip loaded successfully.', 'ok');
    } catch (err) {
      showResult('');
      showStatus('Could not load a tip. Check your connection and try again.', 'error');
      console.error('Advice Slip fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }

  button.addEventListener('click', fetchAdvice);
})();
