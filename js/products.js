/**
 * RUDRA TECHNOCAST — Products Page Functionality
 * Handles: Dynamic rendering, search, category & tag filters, pagination (Load More), and full-screen Lightbox.
 */

(function () {
  'use strict';

  // State Management
  let activeCategory = 'all';
  let activeTag = 'all';
  let searchQuery = '';
  let currentPage = 1;
  const itemsPerPage = 18;

  let filteredProducts = [];
  let lightboxIndex = -1;

  // DOM Elements
  let gridContainer;
  let noProductsEl;
  let loadMoreContainer;
  let loadMoreBtn;
  let searchInput;
  let resetBtn;

  // Lightbox DOM Elements
  let lightboxModal;
  let lightboxImg;
  let lightboxTitle;
  let lightboxBadge;
  let lightboxDesc;
  let lightboxWaBtn;
  let lightboxPrevBtn;
  let lightboxNextBtn;
  let lightboxCloseBtn;

  // Intersection Observer for newly added elements
  let fadeObserver;

  /* ── DOM Ready ──────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    // Cache DOM elements
    gridContainer     = document.getElementById('products-grid');
    noProductsEl      = document.getElementById('no-products');
    loadMoreContainer = document.getElementById('load-more-container');
    loadMoreBtn       = document.getElementById('load-more-btn');
    searchInput       = document.getElementById('product-search');
    resetBtn          = document.getElementById('reset-filters-btn');

    // Lightbox caching
    lightboxModal    = document.getElementById('lightbox-modal');
    lightboxImg      = document.getElementById('lightbox-img');
    lightboxTitle    = document.getElementById('lightbox-title');
    lightboxBadge    = document.getElementById('lightbox-badge');
    lightboxDesc     = document.getElementById('lightbox-desc');
    lightboxWaBtn    = document.getElementById('lightbox-wa-btn');
    lightboxPrevBtn  = document.getElementById('lightbox-prev');
    lightboxNextBtn  = document.getElementById('lightbox-next');
    lightboxCloseBtn = document.getElementById('lightbox-close');

    if (!gridContainer) return; // Not on products page

    // Initialize Intersection Observer for card fade-ins
    initObserver();

    // Event Listeners
    initFilterTabs();
    initTagFilters();
    initSearch();
    initLoadMore();
    initLightbox();

    if (resetBtn) {
      resetBtn.addEventListener('click', resetFilters);
    }

    // Initial Filter & Render
    applyFilters();
  }

  /* ── Intersection Observer ──────────────────────────────── */
  function initObserver() {
    fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });
  }

  /* ── Filter Tabs Event ──────────────────────────────────── */
  function initFilterTabs() {
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeCategory = tab.dataset.filter;
        applyFilters();
      });
    });
  }

  /* ── Tag Pills Event ────────────────────────────────────── */
  function initTagFilters() {
    const pills = document.querySelectorAll('.tag-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeTag = pill.dataset.tag;
        applyFilters();
      });
    });
  }

  /* ── Search Event ───────────────────────────────────────── */
  function initSearch() {
    if (!searchInput) return;
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }

  /* ── Load More Event ────────────────────────────────────── */
  function initLoadMore() {
    if (!loadMoreBtn) return;
    loadMoreBtn.addEventListener('click', () => {
      currentPage++;
      renderGrid(true);
    });
  }

  /* ── Filter Engine ──────────────────────────────────────── */
  function applyFilters() {
    if (typeof PRODUCTS_DATA === 'undefined') {
      console.error("PRODUCTS_DATA is not loaded.");
      return;
    }

    filteredProducts = PRODUCTS_DATA.filter(prod => {
      // 1. Category Filter
      const matchCategory = activeCategory === 'all' || prod.category === activeCategory;

      // 2. Tag Filter
      const matchTag = activeTag === 'all' || (prod.tags && prod.tags.includes(activeTag));

      // 3. Search Query Filter
      let matchSearch = true;
      if (searchQuery) {
        const nameMatch = prod.name.toLowerCase().includes(searchQuery);
        const descMatch = prod.description.toLowerCase().includes(searchQuery);
        const catMatch  = prod.category.toLowerCase().includes(searchQuery);
        const tagsMatch = prod.tags && prod.tags.some(tag => tag.toLowerCase().includes(searchQuery));
        
        matchSearch = nameMatch || descMatch || catMatch || tagsMatch;
      }

      return matchCategory && matchTag && matchSearch;
    });

    currentPage = 1;
    renderGrid(false);
  }

  /* ── Render Product Grid ────────────────────────────────── */
  function renderGrid(append = false) {
    if (!append) {
      gridContainer.innerHTML = '';
    }

    const startIndex = append ? (currentPage - 1) * itemsPerPage : 0;
    const endIndex   = Math.min(currentPage * itemsPerPage, filteredProducts.length);
    const visibleBatch = filteredProducts.slice(startIndex, endIndex);

    if (filteredProducts.length === 0) {
      noProductsEl.style.display = 'block';
      loadMoreContainer.style.display = 'none';
      return;
    } else {
      noProductsEl.style.display = 'none';
    }

    visibleBatch.forEach((prod, i) => {
      const globalIndex = startIndex + i;
      const card = document.createElement('div');
      card.className = 'prod-card fade-in';
      
      // Calculate delay for entrance animation (max 0.3s)
      const delay = (i % 6) * 0.05;
      card.style.transitionDelay = `${delay}s`;

      // Map category to readable badge text
      let badgeText = 'Custom Part';
      if (prod.category === 'ductile') badgeText = 'Ductile Iron';
      if (prod.category === 'grey') badgeText = 'Grey Iron';

      // Prefilled WhatsApp Enquiry URL
      const waMessage = encodeURIComponent(`Hello Rudra Technocast, I am interested in your product "${prod.name}" (ID: ${prod.id}) shown on your website. Please share specifications and pricing.`);
      const waLink = `https://wa.me/918866683454?text=${waMessage}`;

      card.innerHTML = `
        <div class="prod-card-img">
          <span class="prod-badge ${prod.category}">${badgeText}</span>
          <img src="${prod.imagePath}" alt="${prod.name}" loading="lazy" class="product-gallery-img">
          <div class="prod-card-overlay">
            <button class="zoom-btn" aria-label="View Image">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Quick View
            </button>
          </div>
        </div>
        <div class="prod-card-body">
          <h4>${prod.name}</h4>
          <p>${prod.description}</p>
          <div class="prod-specs">
            ${prod.tags.map(tag => `<span class="prod-spec-tag">${tag}</span>`).join('')}
          </div>
        </div>
        <div class="prod-card-footer">
          <button class="btn btn-sm btn-outline-red view-details-btn">Zoom</button>
          <a href="${waLink}" class="btn btn-sm btn-whatsapp" target="_blank" rel="noopener">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" style="width:12px;height:12px;margin-right:4px;"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
            Enquire
          </a>
        </div>
      `;

      // Set up click handlers on zoom triggers
      card.querySelector('.prod-card-img').addEventListener('click', () => {
        openLightbox(globalIndex);
      });
      card.querySelector('.view-details-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openLightbox(globalIndex);
      });

      gridContainer.appendChild(card);
      
      // Observe card for entrance transition
      if (fadeObserver) {
        fadeObserver.observe(card);
      }
    });

    // Handle Load More Button Visibility
    if (endIndex < filteredProducts.length) {
      loadMoreContainer.style.display = 'block';
    } else {
      loadMoreContainer.style.display = 'none';
    }
  }

  /* ── Lightbox Engine ────────────────────────────────────── */
  function initLightbox() {
    if (!lightboxModal) return;

    lightboxCloseBtn.addEventListener('click', closeLightbox);
    lightboxPrevBtn.addEventListener('click', prevImage);
    lightboxNextBtn.addEventListener('click', nextImage);

    // Close on overlay click
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal || e.target.classList.contains('lightbox-content') || e.target.classList.contains('lightbox-image-wrapper')) {
        closeLightbox();
      }
    });

    // Keyboard bindings
    document.addEventListener('keydown', (e) => {
      if (lightboxModal.getAttribute('aria-hidden') === 'false') {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'ArrowRight') nextImage();
      }
    });
  }

  function openLightbox(index) {
    if (index < 0 || index >= filteredProducts.length) return;
    lightboxIndex = index;
    const prod = filteredProducts[index];

    // Populate data
    lightboxImg.src = prod.imagePath;
    lightboxImg.alt = prod.name;
    lightboxTitle.textContent = prod.name;
    lightboxDesc.textContent = prod.description;

    // Reset and apply badge styles
    lightboxBadge.className = 'lightbox-badge';
    let badgeText = 'Custom Part';
    if (prod.category === 'ductile') {
      badgeText = 'Ductile Iron';
      lightboxBadge.classList.add('ductile');
    } else if (prod.category === 'grey') {
      badgeText = 'Grey Iron';
      lightboxBadge.classList.add('grey');
    } else {
      lightboxBadge.classList.add('custom');
    }
    lightboxBadge.textContent = badgeText;

    // WhatsApp Action Link
    const waMessage = encodeURIComponent(`Hello Rudra Technocast, I am interested in your product "${prod.name}" (ID: ${prod.id}) shown on your website. Please share specifications and pricing.`);
    lightboxWaBtn.href = `https://wa.me/918866683454?text=${waMessage}`;

    // Show Lightbox Modal
    lightboxModal.classList.add('active');
    lightboxModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Show/hide navigation arrows based on bounds
    lightboxPrevBtn.style.visibility = index > 0 ? 'visible' : 'hidden';
    lightboxNextBtn.style.visibility = index < filteredProducts.length - 1 ? 'visible' : 'hidden';
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    lightboxModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Clear heavy image path
    setTimeout(() => { lightboxImg.src = ''; }, 200);
  }

  function nextImage() {
    if (lightboxIndex < filteredProducts.length - 1) {
      openLightbox(lightboxIndex + 1);
    }
  }

  function prevImage() {
    if (lightboxIndex > 0) {
      openLightbox(lightboxIndex - 1);
    }
  }

  /* ── Reset Filters ──────────────────────────────────────── */
  function resetFilters() {
    // Reset inputs
    if (searchInput) searchInput.value = '';
    searchQuery = '';

    // Reset category tabs
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(t => t.classList.remove('active'));
    const allTab = document.querySelector('.filter-tab[data-filter="all"]');
    if (allTab) allTab.classList.add('active');
    activeCategory = 'all';

    // Reset tag pills
    const pills = document.querySelectorAll('.tag-pill');
    pills.forEach(p => p.classList.remove('active'));
    const allPill = document.querySelector('.tag-pill[data-tag="all"]');
    if (allPill) allPill.classList.add('active');
    activeTag = 'all';

    applyFilters();
  }

})();
