// Mobile menu
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuClose = document.getElementById('mobileMenuClose');

function setMobileMenu(open) {
  menuToggle.classList.toggle('active', open);
  mobileMenu.classList.toggle('active', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
}

function toggleMobileMenu() {
  setMobileMenu(!mobileMenu.classList.contains('active'));
}

menuToggle.addEventListener('click', toggleMobileMenu);

if (mobileMenuClose) {
  mobileMenuClose.addEventListener('click', () => setMobileMenu(false));
}

// Any link inside the menu closes it.
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setMobileMenu(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mobileMenu.classList.contains('active')) {
    setMobileMenu(false);
    menuToggle.focus();
  }
});

// Close the menu when clicking outside it
document.addEventListener('click', (event) => {
  if (mobileMenu.classList.contains('active') &&
      !mobileMenu.contains(event.target) &&
      !menuToggle.contains(event.target)) {
    setMobileMenu(false);
  }
});

// Scroll progress and nav state. One rAF-throttled passive listener; the
// progress bar and nav are driven by transform and a class, not animated
// layout properties.
const scrollProgress = document.getElementById('scrollProgress');
const mainNav = document.getElementById('mainNav');
let scrollTicking = false;

function updateOnScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
  scrollProgress.style.transform = `scaleX(${progress})`;
  mainNav.classList.toggle('scrolled', window.scrollY > 50);
  scrollTicking = false;
}

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    scrollTicking = true;
    requestAnimationFrame(updateOnScroll);
  }
}, { passive: true });

updateOnScroll();

// Reveal on scroll. Runs on DOMContentLoaded (this script is deferred), not
// on window load, so the hero never waits for CDN scripts, fonts or images.
// Elements are visible by default and only hidden once the `js` class is set
// in <head>; if IntersectionObserver is missing we drop that class.
function initReveal() {
  if (!('IntersectionObserver' in window)) {
    document.documentElement.classList.remove('js');
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    let order = 0;
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.style.setProperty('--reveal-delay', `${Math.min(order, 4) * 50}ms`);
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
      order += 1;
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });

  const watch = (root) => {
    if (root.matches && root.matches('.stagger-fade-in')) observer.observe(root);
    root.querySelectorAll('.stagger-fade-in').forEach(el => observer.observe(el));
  };

  watch(document);

  // Blog posts and case studies are rendered after load (blog.js, Alpine).
  new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) watch(node);
      });
    });
  }).observe(document.body, { childList: true, subtree: true });
}

initReveal();

// Contact form
const contactForm = document.querySelector('#contact form');

if (contactForm) {
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const status = document.getElementById('formStatus');
  const idleLabel = submitButton.innerHTML;
  const fields = ['name', 'email', 'message'].map(id => document.getElementById(id));

  function setStatus(message, isError) {
    status.textContent = message;
    status.classList.toggle('is-error', Boolean(isError));
  }

  function validate() {
    let firstInvalid = null;

    fields.forEach(field => {
      const value = field.value.trim();
      const invalid = !value || (field.type === 'email' && !/^\S+@\S+\.\S+$/.test(value));
      field.setAttribute('aria-invalid', String(invalid));
      if (invalid && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      setStatus('Please add your name, a valid email and a short project brief.', true);
      firstInvalid.focus();
    }

    return !firstInvalid;
  }

  fields.forEach(field => {
    field.addEventListener('input', () => field.setAttribute('aria-invalid', 'false'));
  });

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validate()) return;

    submitButton.disabled = true;
    submitButton.innerHTML = 'Sending… <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>';
    setStatus('', false);

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: 'e0b97764-7c83-4b1a-b9d1-7e41a3efef91',
        name: fields[0].value.trim(),
        email: fields[1].value.trim(),
        message: fields[2].value.trim()
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          contactForm.reset();
          setStatus('Thanks, your request has been sent.', false);
        } else {
          setStatus('Something went wrong. Please try again, or email me directly.', true);
        }
      })
      .catch(() => {
        setStatus('Something went wrong. Please try again, or email me directly.', true);
      })
      .finally(() => {
        submitButton.disabled = false;
        submitButton.innerHTML = idleLabel;
      });
  });
}
