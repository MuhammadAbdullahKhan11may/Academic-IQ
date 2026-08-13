// Smooth scroll effect for nav links (How It Works, About, etc.)
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('nav a[href^="#"]');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      const targetEl = document.querySelector(targetId);

      if (targetEl) {
        e.preventDefault();

        const headerOffset = 80; // adjust if your header height differs
        const elementPosition = targetEl.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
});
// Show/hide password toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggles = document.querySelectorAll('.toggle-password');

  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const targetId = toggle.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      toggle.textContent = isHidden ? '🙈' : '👁️';
      toggle.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    });
  });
});

// Sign up form
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const fullName = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const submitBtn = signupForm.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Could not create account.');
      }

      localStorage.setItem('aiq_token', data.token);
      localStorage.setItem('aiq_user', JSON.stringify(data.user));

      window.location.href = 'Homepage.html';
    } catch (err) {
      alert(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

// Sign in form
const signinForm = document.getElementById('signinForm');
if (signinForm) {
  signinForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const submitBtn = signinForm.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    try {
      const response = await fetch('http://localhost:5000/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Could not sign in.');
      }

      localStorage.setItem('aiq_token', data.token);
      localStorage.setItem('aiq_user', JSON.stringify(data.user));

      window.location.href = 'Homepage.html';
    } catch (err) {
      alert(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}