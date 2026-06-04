// ══════════════════════════════════════
//  SHOWCASE
//  Bottom cards: static, click → product page
//  Mobile: touch swipe on stage changes model
// ══════════════════════════════════════

const PRODUCTS = [
  {
    index:  0,
    name:   'Scrubs & Surgical Uniforms',
    url:    'products/scrubs.html',
  },
  {
    index:  1,
    name:   'Lab Coats',
    url:    'products/lab-coats.html',
  },
  {
    index:  2,
    name:   'Nurse Uniforms',
    url:    'products/nurse-uniforms.html',
  },
  {
    index:  3,
    name:   'Chef & Cooking Uniforms',
    url:    'products/chef-uniforms.html',
  },
  {
    index:  4,
    name:   'Protective & Hygiene Workwear',
    url:    'products/protective-workwear.html',
  },
  {
    index:  5,
    name:   'Aprons',
    url:    'products/aprons.html',
  },
  {
    index:  6,
    name:   'School Uniforms',
    url:    'products/school-uniforms.html',
  },
  {
    index:  7,
    name:   'Custom Embroidery & Logos',
    url:    'products/custom-embroidery.html',
  },
];

let currentIndex = 0;
let touchStartX  = 0;
let touchEndX    = 0;

// ── DOM refs ──────────────────────────
const stage       = document.getElementById('showcaseStage');
const prevBtn     = document.getElementById('prevBtn');
const nextBtn     = document.getElementById('nextBtn');
const namePill    = document.getElementById('activeProductName');
const modelSlots  = document.querySelectorAll('.model-slot');

// ── Switch model in stage ─────────────
function goTo(index) {
  // Wrap around
  currentIndex = (index + PRODUCTS.length) % PRODUCTS.length;
  const product = PRODUCTS[currentIndex];

  // Update model slots visibility
  modelSlots.forEach((slot) => {
    const i = parseInt(slot.dataset.index, 10);
    slot.classList.remove('slot-active', 'slot-prev', 'slot-next');
    if (i === currentIndex) {
      slot.classList.add('slot-active');
    } else if (i === (currentIndex - 1 + PRODUCTS.length) % PRODUCTS.length) {
      slot.classList.add('slot-prev');
    } else if (i === (currentIndex + 1) % PRODUCTS.length) {
      slot.classList.add('slot-next');
    }
  });

  // Update name pill text + href — clicking it goes to product page
  if (namePill) {
    // Escape HTML entities for display
    namePill.textContent = '';
    const textNode = document.createTextNode(product.name);
    namePill.appendChild(textNode);

    // Add arrow icon back
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'pill-arrow');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M3 8h10M9 4l4 4-4 4');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '1.8');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);
    namePill.appendChild(svg);

    // Update href so clicking navigates to product page
    namePill.setAttribute('href', product.url);
    namePill.setAttribute('aria-label', `View ${product.name} collection`);
  }
}

// ── Arrow buttons — change model only ──
function initArrows() {
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goTo(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goTo(currentIndex + 1);
    });
  }
}

// ── Touch swipe on stage — mobile ──────
function initTouchSwipe() {
  if (!stage) return;

  stage.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  stage.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    // Minimum 40px swipe to register
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swiped left → next
        goTo(currentIndex + 1);
      } else {
        // Swiped right → prev
        goTo(currentIndex - 1);
      }
    }
  }, { passive: true });
}

// ── Keyboard arrow keys ────────────────
function initKeyboard() {
  document.addEventListener('keydown', (e) => {
    // Only activate when showcase section is visible
    const showcase = document.getElementById('products');
    if (!showcase) return;
    const rect = showcase.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    if (e.key === 'ArrowLeft')  goTo(currentIndex - 1);
    if (e.key === 'ArrowRight') goTo(currentIndex + 1);
  });
}

function initThumbHighlight() {
  const thumbCards = document.querySelectorAll('.showcase-scroller .product-thumb');

  // Re-export goTo so we can patch it
  window.__showcaseGoTo = goTo;

  // Patch goTo to also update thumb highlights
  const originalGoTo = goTo;
  window.goTo = function(index) {
    originalGoTo(index);
    // currentIndex is now updated
    thumbCards.forEach((card, i) => {
      card.classList.toggle('thumb-stage-active', i === currentIndex);
    });
  };

  // Init first highlight
  thumbCards.forEach((card, i) => {
    card.classList.toggle('thumb-stage-active', i === 0);
  });
}

// ── INIT ──────────────────────────────
function initShowcase() {
  if (!stage) return; // not on homepage

  // Set initial state
  goTo(0);
  initArrows();
  initTouchSwipe();
  initKeyboard();
  initThumbHighlight();
}

document.addEventListener('DOMContentLoaded', initShowcase);