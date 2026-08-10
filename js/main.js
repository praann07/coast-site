(function () {
const config = window.COAST_CONFIG || {};
const SUPABASE_URL = config.SUPABASE_URL;
const SUPABASE_ANON_KEY = config.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  const forms = document.querySelectorAll('[data-waitlist-form]');
  forms.forEach((f) => { f.style.display = 'none'; });
  const msg = document.querySelector('#wl-message');
  if (msg) msg.textContent = 'Site config is missing. Please create js/config.js from js/config.example.js.';
  return;
}

const nav = document.getElementById('nav');
const toast = document.getElementById('toast');
const heroForm = document.getElementById('hero-waitlist');
const waitlistForm = document.getElementById('waitlist-form');
const wlMessage = document.getElementById('wl-message');
const statCount = document.getElementById('stat-count');

let count = 42;

heroForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('hero-email').value.trim();
  if (!email) return;
  await submitWaitlist({ email });
  heroForm.reset();
});

waitlistForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('wl-name').value.trim();
  const email = document.getElementById('wl-email').value.trim();
  const phone = document.getElementById('wl-phone').value.trim();
  if (!email) return;
  wlMessage.textContent = 'Joining...';
  await submitWaitlist({ name, email, phone });
  waitlistForm.reset();
  wlMessage.textContent = '';
});

async function submitWaitlist(data) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({
        name: data.name || null,
        email: data.email,
        phone: data.phone || null,
      }),
    });

    if (res.ok) {
      count++;
      if (statCount) {
        animateCount(statCount, count);
      }
      showToast('You\'re on the list! We\'ll notify you at launch.');
    } else {
      showToast('Something went wrong. Try again?', 'error');
    }
  } catch {
    showToast('Network error — please check your connection and try again.', 'error');
  }
}

function animateCount(el, target) {
  const current = parseInt(el.textContent) || 0;
  const step = Math.max(1, Math.floor((target - current) / 10));
  let val = current;
  const interval = setInterval(() => {
    val += step;
    if (val >= target) {
      val = target;
      clearInterval(interval);
    }
    el.textContent = val;
  }, 30);
}

let toastTimeout;

function showToast(message, type = '') {
  toast.textContent = message;
  toast.className = type;
  clearTimeout(toastTimeout);
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    }
  },
  { threshold: 0.1 }
);

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 80);
});

document.querySelector('.nav-btn').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('waitlist').scrollIntoView({ behavior: 'smooth' });
});
})();
