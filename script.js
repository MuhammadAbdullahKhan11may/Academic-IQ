document.addEventListener('DOMContentLoaded', function () {

  // ==========================================
  // MOBILE NAVIGATION
  // ==========================================

  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
      });
    });
  }


  // ==========================================
  // SCROLL REVEAL
  // ==========================================

  const revealItems = document.querySelectorAll(
    '.section-heading, .insight-board, .scenario-board, .calculation-board'
  );

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add('visible');
    });
  }


  // ==========================================
  // PASSWORD SHOW / HIDE
  // ==========================================

  document.querySelectorAll('.toggle-password').forEach(function (button) {
    button.addEventListener('click', function () {
      const targetId = button.dataset.target;
      const input = document.getElementById(targetId);

      if (!input) return;

      if (input.type === 'password') {
        input.type = 'text';
        button.textContent = 'Hide';
        button.setAttribute('aria-label', 'Hide password');
      } else {
        input.type = 'password';
        button.textContent = 'Show';
        button.setAttribute('aria-label', 'Show password');
      }
    });
  });


  // ==========================================
  // AUTH HELPERS
  // ==========================================

  const API_BASE = 'http://localhost:5000/api/auth';

  function saveAuth(data) {
    if (data.token) {
      localStorage.setItem('aiq_token', data.token);
    }

    if (data.user) {
      localStorage.setItem('aiq_user', JSON.stringify(data.user));
    }
  }

  function showAuthError(form, message) {
    let error = form.querySelector('.auth-error');

    if (!error) {
      error = document.createElement('div');
      error.className = 'auth-error';

      error.style.marginTop = '14px';
      error.style.padding = '10px 12px';
      error.style.border = '1px solid #c94b4b';
      error.style.color = '#a83232';
      error.style.background = '#fff5f5';
      error.style.fontSize = '13px';

      form.appendChild(error);
    }

    error.textContent = message;
  }

  function clearAuthError(form) {
    const error = form.querySelector('.auth-error');

    if (error) {
      error.remove();
    }
  }

  function setButtonLoading(button, loading, originalText) {
    if (loading) {
      button.disabled = true;
      button.dataset.originalText = button.textContent;
      button.textContent = 'Please wait...';
    } else {
      button.disabled = false;
      button.textContent = originalText || button.dataset.originalText || 'Submit';
    }
  }


  // ==========================================
  // SIGN IN
  // ==========================================

  const signinForm = document.getElementById('signinForm');

  if (signinForm) {
    signinForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      clearAuthError(signinForm);

      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
      const submitButton = signinForm.querySelector('button[type="submit"]');

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        showAuthError(signinForm, 'Please enter your email and password.');
        return;
      }

      const originalText = submitButton.textContent;
      setButtonLoading(submitButton, true);

      try {
        const response = await fetch(`${API_BASE}/signin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            password: password
          })
        });

        const data = await response.json().catch(function () {
          return {};
        });

        if (!response.ok) {
          throw new Error(data.error || 'Invalid email or password.');
        }

        saveAuth(data);

        window.location.href = 'Homepage.html';

      } catch (error) {
        console.error('Signin error:', error);

        showAuthError(
          signinForm,
          error.message || 'Could not sign in. Make sure the AcademicIQ backend is running.'
        );

        setButtonLoading(submitButton, false, originalText);
      }
    });
  }


  // ==========================================
  // SIGN UP
  // ==========================================

  const signupForm = document.getElementById('signupForm');

  if (signupForm) {
    signupForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      clearAuthError(signupForm);

      const fullnameInput = document.getElementById('fullname');
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
      const submitButton = signupForm.querySelector('button[type="submit"]');

      const fullName = fullnameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!fullName || !email || !password) {
        showAuthError(signupForm, 'Please complete all fields.');
        return;
      }

      if (password.length < 6) {
        showAuthError(
          signupForm,
          'Password must be at least 6 characters.'
        );
        return;
      }

      const originalText = submitButton.textContent;
      setButtonLoading(submitButton, true);

      try {
        const response = await fetch(`${API_BASE}/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fullName: fullName,
            email: email,
            password: password
          })
        });

        const data = await response.json().catch(function () {
          return {};
        });

        if (!response.ok) {
          throw new Error(data.error || 'Could not create account.');
        }

        saveAuth(data);

        window.location.href = 'Homepage.html';

      } catch (error) {
        console.error('Signup error:', error);

        showAuthError(
          signupForm,
          error.message || 'Could not create account. Make sure the AcademicIQ backend is running.'
        );

        setButtonLoading(submitButton, false, originalText);
      }
    });
  }

});