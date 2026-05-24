/**
 * RUDRA TECHNOCAST — Hero Slider
 * Auto-advancing slider with dot navigation and arrow controls
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const slider = document.querySelector('.hero-slides');
    if (!slider) return;

    const slides    = slider.querySelectorAll('.hero-slide');
    const dots      = document.querySelectorAll('.hero-dot');
    const prevBtn   = document.getElementById('hero-prev');
    const nextBtn   = document.getElementById('hero-next');

    if (!slides.length) return;

    let current  = 0;
    let autoPlay = null;
    const DELAY  = 5000;

    function goTo(index) {
      slides[current].classList.remove('active');
      slides[current].classList.add('prev');
      if (dots[current]) dots[current].classList.remove('active');

      setTimeout(() => {
        slides[current].classList.remove('prev');
      }, 1000);

      current = (index + slides.length) % slides.length;

      slides[current].classList.add('active');
      if (dots[current]) dots[current].classList.add('active');
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAuto() {
      stopAuto();
      autoPlay = setInterval(next, DELAY);
    }

    function stopAuto() {
      if (autoPlay) { clearInterval(autoPlay); autoPlay = null; }
    }

    // Initial state
    slides[0].classList.add('active');
    if (dots[0]) dots[0].classList.add('active');

    // Arrow buttons
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAuto(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAuto(); });

    // Dot navigation
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { goTo(i); startAuto(); });
    });

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX   = 0;

    slider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? next() : prev();
        startAuto();
      }
    }, { passive: true });

    // Pause on hover
    slider.addEventListener('mouseenter', stopAuto);
    slider.addEventListener('mouseleave', startAuto);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { prev(); startAuto(); }
      if (e.key === 'ArrowRight') { next(); startAuto(); }
    });

    startAuto();
  });
})();
