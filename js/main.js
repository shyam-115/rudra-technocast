/**
 * RUDRA TECHNOCAST — Main JavaScript
 * Handles: Nav, Sidebar, Scroll effects, Counters, Fade-ins, Back to top
 */

(function () {
  'use strict';

  /* ── DOM Ready ──────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initHeader();
    initSidebar();
    initScrollEffects();
    initCounters();
    initFadeIn();
    initBackToTop();
    setActiveNav();
  }

  /* ── Header Scroll ──────────────────────────────────────── */
  function initHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;

    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 60);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile Sidebar ─────────────────────────────────────── */
  function initSidebar() {
    const hamburger = document.getElementById('hamburger-btn');
    const sidebar   = document.getElementById('mobile-sidebar');
    const overlay   = document.getElementById('sidebar-overlay');
    const closeBtn  = document.getElementById('sidebar-close');

    if (!hamburger || !sidebar || !overlay) return;

    function openSidebar() {
      sidebar.classList.add('open');
      overlay.classList.add('active');
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
      sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });

    overlay.addEventListener('click', closeSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSidebar();
    });

    // Close on nav link click
    sidebar.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeSidebar);
    });
  }

  /* ── Set Active Nav Link ────────────────────────────────── */
  function setActiveNav() {
    const current = window.location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.desktop-nav a, .sidebar-nav a').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      const linkPage = href.split('/').pop();
      const isHome = (linkPage === 'index.html' || linkPage === '') && (current === 'index.html' || current === '');
      if (isHome || linkPage === current) {
        link.classList.add('active');
      }
    });
  }

  /* ── Intersection Observer — Fade In ────────────────────── */
  function initFadeIn() {
    const els = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => observer.observe(el));
  }

  /* ── Animated Counters ──────────────────────────────────── */
  function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  function animateCounter(el) {
    const target   = parseInt(el.dataset.counter, 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 1800;
    const start    = performance.now();

    function step(timestamp) {
      const elapsed  = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const value    = Math.round(ease * target);
      el.textContent = value.toLocaleString('en-IN') + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  /* ── Scroll Effects (Back to Top visibility) ────────────── */
  function initScrollEffects() {
    const floatTop = document.getElementById('float-top');
    if (!floatTop) return;

    window.addEventListener('scroll', () => {
      floatTop.classList.toggle('show', window.scrollY > 400);
    }, { passive: true });

    floatTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Back to Top ────────────────────────────────────────── */
  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
