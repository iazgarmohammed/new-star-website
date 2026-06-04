function initProductCardsAnimation() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const cards = document.querySelectorAll('.products-grid .product-card');
  if (!cards.length) return;

  gsap.set(cards, { opacity: 0, y: 48, scale: 0.97 });

  gsap.to(cards, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.75,
    stagger: {
      each: 0.08,
      from: 'start',
    },
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.products-grid',
      start: 'top 82%',
      once: true,
    },
  });
}

// ── SECTION TITLE / SUBTITLE FADE ────
// Soft fade-up for all section headings
function initSectionHeadersAnimation() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  document.querySelectorAll('.section-title, .section-subtitle').forEach((el) => {
    gsap.set(el, { opacity: 0, y: 28 });
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true,
      },
    });
  });
}

// ── WHO WE SERVE ─────────────────────
// Cards slide in from sides — premium feel
function initServeAnimation() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const cards = document.querySelectorAll('.serve-card');
  if (!cards.length) return;

  cards.forEach((card, i) => {
    const dir = i % 2 === 0 ? -60 : 60;
    gsap.set(card, { opacity: 0, x: dir, y: 20 });
    gsap.to(card, {
      opacity: 1,
      x: 0,
      y: 0,
      duration: 0.85,
      delay: i * 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.serve-grid',
        start: 'top 80%',
        once: true,
      },
    });
  });
}

// ── HOW IT WORKS ─────────────────────
// Steps cascade up with slight scale, connecting line draws after
function initProcessAnimation() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const steps = document.querySelectorAll('.process-step');
  if (!steps.length) return;

  gsap.set(steps, { opacity: 0, y: 40, scale: 0.92 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.process-steps',
      start: 'top 78%',
      once: true,
    },
  });

  tl.to(steps, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.7,
    stagger: 0.18,
    ease: 'power2.out',
  });

  // Draw the connecting line after steps appear
  tl.call(() => {
    const stepsEl = document.querySelector('.process-steps');
    if (stepsEl) stepsEl.classList.add('line-drawn');
  }, null, '-=0.2');
}

// ── TESTIMONIALS ─────────────────────
// Whole swiper container fades up
function initTestimonialsAnimation() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const swiper = document.querySelector('.testimonials-swiper');
  if (!swiper) return;

  gsap.set(swiper, { opacity: 0, y: 40 });

  gsap.to(swiper, {
    opacity: 1,
    y: 0,
    duration: 1.0,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.testimonials-section',
      start: 'top 78%',
      once: true,
    },
  });
}

// ── ABOUT TEASER ─────────────────────
// Text from left, visual grid from right
function initAboutTeaserAnimation() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const text = document.querySelector('.about-teaser-text');
  const grid = document.querySelector('.about-visual-grid');

  if (!text && !grid) return;

  const trigger = {
    trigger: '.about-teaser-section',
    start: 'top 78%',
    once: true,
  };

  if (text) {
    gsap.set(text, { opacity: 0, x: -48 });
    gsap.to(text, {
      opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: trigger,
    });
  }

  if (grid) {
    gsap.set(grid, { opacity: 0, x: 48 });
    gsap.to(grid, {
      opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: trigger,
    });
  }
}

// ── CTA BANNER ───────────────────────
function initCtaBannerAnimation() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const banner = document.querySelector('.cta-banner');
  if (!banner) return;

  const h2  = banner.querySelector('h2');
  const p   = banner.querySelector('p');
  const btn = banner.querySelector('.btn');

  [h2, p, btn].filter(Boolean).forEach((el, i) => {
    gsap.set(el, { opacity: 0, y: 24 });
    gsap.to(el, {
      opacity: 1, y: 0,
      duration: 0.7,
      delay: i * 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: banner,
        start: 'top 82%',
        once: true,
      },
    });
  });
}

// ── SWIPER INIT ──────────────────────
function initTestimonialsSwiper() {
  if (typeof Swiper === 'undefined') return;
  if (!document.querySelector('.testimonials-swiper')) return;

  new Swiper('.testimonials-swiper', {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    autoplay: { delay: 4500, disableOnInteraction: false },
    pagination: { el: '.swiper-pagination', clickable: true },
    breakpoints: {
      640:  { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },
  });
}

// ── INIT ALL ─────────────────────────
function initAllAnimations() {
  initLenis();
  initHeroAnimation();
  initStatsAnimation();
  initSectionHeadersAnimation();
  initProductCardsAnimation();
  initServeAnimation();
  initProcessAnimation();
  initTestimonialsAnimation();
  initAboutTeaserAnimation();
  initCtaBannerAnimation();
  initTestimonialsSwiper();
}

// Wait for DOM + CDN scripts
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initAllAnimations, 120);
  });
} else {
  setTimeout(initAllAnimations, 120);
}