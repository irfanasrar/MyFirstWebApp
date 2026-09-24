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
    feedback.classList.add('is-visible');
    if (isError) {
      feedback.classList.add('is-error');
    } else {
      feedback.classList.remove('is-error');
    }
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
      var hidden = tip.classList.toggle('is-hidden');
      toggleTip.textContent = hidden ? 'Show tip' : 'Hide tip';
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

    if (!name) {
      showMessage('Please enter your name before sending.', true);
      if (nameInput) {
        nameInput.focus();
      }
      return;
    }

    if (!email || email.indexOf('@') === -1) {
      showMessage('Please enter a valid email address (it should include @).', true);
      if (emailInput) {
        emailInput.focus();
      }
      return;
    }

    if (!topic) {
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
