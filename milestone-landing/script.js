(function() {
  'use strict';

  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

  // Year
  qs('#year').textContent = new Date().getFullYear();

  // Smooth scroll for anchor links
  qsa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = qs(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Theme toggle (persist)
  const themeToggle = qs('#themeToggle');
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme) document.documentElement.dataset.theme = storedTheme;
  themeToggle?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
  });

  // Intersection reveal
  const revealEls = qsa('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });
  revealEls.forEach(el => io.observe(el));

  // Timeline progress fill based on scroll
  const timeline = qs('.timeline');
  const timelineFill = qs('#timelineFill');
  const timelineList = qs('#timelineList');
  function updateTimelineFill() {
    if (!timeline || !timelineFill || !timelineList) return;
    const rect = timelineList.getBoundingClientRect();
    const viewport = window.innerHeight;
    const totalScrollable = rect.height - viewport * 0.2; // leave some space
    const visible = Math.min(Math.max((viewport * 0.8 - Math.max(0, -rect.top)), 0), rect.height);
    const progress = Math.max(0, Math.min(visible / Math.max(totalScrollable, 1), 1));
    timelineFill.style.height = (progress * 100).toFixed(2) + '%';
  }
  updateTimelineFill();
  window.addEventListener('scroll', updateTimelineFill, { passive: true });
  window.addEventListener('resize', updateTimelineFill);

  // Stats counting
  const counters = qsa('[data-count-to]');
  const counterIo = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-count-to') || '0', 10);
      const duration = 1200;
      const startTime = performance.now();
      const startVal = 0;
      function tick(now) {
        const t = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        const val = Math.round(startVal + (target - startVal) * eased);
        el.textContent = val.toLocaleString();
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterIo.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(el => counterIo.observe(el));

  // Next milestone detection and countdown
  const milestones = qsa('[data-milestone-date]');
  const ticker = qs('#nextMilestoneTicker');
  const nextLabel = qs('#nextLabel');
  const dEl = qs('#d'), hEl = qs('#h'), mEl = qs('#m'), sEl = qs('#s');

  function getNextMilestone() {
    const now = new Date();
    const future = milestones
      .map(m => ({ el: m, date: new Date(m.getAttribute('data-milestone-date') || '') }))
      .filter(o => o.date instanceof Date && !isNaN(o.date) && o.date >= now)
      .sort((a, b) => a.date - b.date);
    if (future.length > 0) return future[0];
    // fallback: 30 days from now
    return { el: null, date: new Date(now.getTime() + 30 * 24 * 3600 * 1000) };
  }

  let next = getNextMilestone();
  function updateTicker() {
    if (!ticker || !next) return;
    const label = next.el?.querySelector('h3')?.textContent || 'Next Milestone';
    const dateStr = next.date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    ticker.innerHTML = `Next up: <strong>${label}</strong> · <span>${dateStr}</span>`;
    if (nextLabel) nextLabel.textContent = `${label} on ${dateStr}`;
  }
  updateTicker();

  function pad(n) { return n.toString().padStart(2, '0'); }
  function updateCountdown() {
    if (!next) return;
    const now = new Date();
    const diff = Math.max(0, next.date - now);
    const days = Math.floor(diff / (24 * 3600 * 1000));
    const hours = Math.floor((diff % (24 * 3600 * 1000)) / (3600 * 1000));
    const minutes = Math.floor((diff % (3600 * 1000)) / (60 * 1000));
    const seconds = Math.floor((diff % (60 * 1000)) / 1000);
    if (dEl) dEl.textContent = pad(days);
    if (hEl) hEl.textContent = pad(hours);
    if (mEl) mEl.textContent = pad(minutes);
    if (sEl) sEl.textContent = pad(seconds);
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Form (demo) handler
  const ctaForm = qs('.cta-form');
  ctaForm?.addEventListener('submit', () => {
    const email = qs('#email')?.value || '';
    alert(`Thanks! We\'ll notify ${email} when your next milestone is near.`);
  });
})();