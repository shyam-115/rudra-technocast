/**
 * RUDRA TECHNOCAST — Contact Form Validation & Submission
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contact-form');
    if (!form) return;

    /* ── Validation rules ─────────────────────────────────── */
    const rules = {
      name:    { required: true, minLen: 2,  label: 'Full Name' },
      company: { required: false,             label: 'Company' },
      email:   { required: true, email: true, label: 'Email' },
      phone:   { required: true, phone: true, label: 'Phone' },
      product: { required: true,              label: 'Product Interest' },
      message: { required: true, minLen: 10,  label: 'Message' },
    };

    function validateField(name, value) {
      const rule = rules[name];
      if (!rule) return null;

      if (rule.required && !value.trim()) {
        return `${rule.label} is required.`;
      }
      if (rule.minLen && value.trim().length < rule.minLen) {
        return `${rule.label} must be at least ${rule.minLen} characters.`;
      }
      if (rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Please enter a valid email address.';
      }
      if (rule.phone && !/^[\d\s\+\-\(\)]{7,15}$/.test(value)) {
        return 'Please enter a valid phone number.';
      }
      return null;
    }

    function showError(field, msg) {
      const group = field.closest('.form-group');
      if (!group) return;
      group.classList.add('has-error');
      field.classList.add('error');
      const errEl = group.querySelector('.error-msg');
      if (errEl) errEl.textContent = msg;
    }

    function clearError(field) {
      const group = field.closest('.form-group');
      if (!group) return;
      group.classList.remove('has-error');
      field.classList.remove('error');
    }

    /* Live validation on blur */
    form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('blur', () => {
        const err = validateField(field.name, field.value);
        err ? showError(field, err) : clearError(field);
      });

      field.addEventListener('input', () => {
        if (field.classList.contains('error')) {
          const err = validateField(field.name, field.value);
          err ? showError(field, err) : clearError(field);
        }
      });
    });

    /* ── Form Submit ──────────────────────────────────────── */
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      let isValid = true;

      form.querySelectorAll('input, select, textarea').forEach(field => {
        if (!field.name) return;
        const err = validateField(field.name, field.value);
        if (err) { showError(field, err); isValid = false; }
        else { clearError(field); }
      });

      if (!isValid) {
        const firstError = form.querySelector('.error');
        if (firstError) firstError.focus();
        return;
      }

      /* ── Submit button state ──────────────────────────────── */
      const submitBtn = form.querySelector('[type="submit"]');
      const origText  = submitBtn.innerHTML;
      submitBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Sending...';
      submitBtn.disabled = true;

      /* Simulate submission (replace with real API / mailto / FormSubmit) */
      setTimeout(() => {
        form.style.display = 'none';
        const success = document.getElementById('form-success');
        if (success) success.classList.add('show');
        form.reset();
      }, 1500);
    });
  });
})();
