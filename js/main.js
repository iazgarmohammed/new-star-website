import { countUp, showToast } from './utils.js';

// ══════════════════════════════════════
//  NAVBAR — scroll behavior + hamburger
// ══════════════════════════════════════
function initNavbar() {
  const navbar     = document.getElementById('navbar');
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-menu a');

  if (!navbar) return;

  // Transparent → scrolled
  function handleScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run once on load

  // Hamburger toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = isOpen ? '' : 'hidden';
      hamburger.setAttribute('aria-expanded', String(!isOpen));
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // Active nav link highlight via IntersectionObserver
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.navbar-links a');

  if (sections.length && navLinks.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${entry.target.id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '-80px 0px 0px 0px',
    });

    sections.forEach(sec => observer.observe(sec));
  }
}

// ══════════════════════════════════════
//  STATS COUNT-UP
// ══════════════════════════════════════
function initStatsCountUp() {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (!statNumbers.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        const numSpan = el.querySelector('.num');

        if (numSpan && !el.dataset.animated) {
          el.dataset.animated = 'true';
          countUp(numSpan, target, 1800);
        }

        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => observer.observe(el));
}

// ══════════════════════════════════════
//  SCROLL REVEAL (fallback without GSAP)
// ══════════════════════════════════════
function initScrollReveal() {
  const revealEls = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-scale'
  );
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el    = entry.target;
        const delay = parseFloat(el.dataset.delay || 0) * 1000;
        setTimeout(() => {
          el.classList.add('revealed');
        }, delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => observer.observe(el));
}

// ══════════════════════════════════════
//  PROCESS LINE DRAW
// ══════════════════════════════════════
function initProcessLine() {
  const steps = document.querySelector('.process-steps');
  if (!steps) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        steps.classList.add('line-drawn');
        observer.unobserve(steps);
      }
    });
  }, { threshold: 0.4 });

  observer.observe(steps);
}

// ══════════════════════════════════════
//  SMOOTH SCROLL for anchor links
// ══════════════════════════════════════
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const navbarHeight = document.getElementById('navbar')?.offsetHeight || 80;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

      // If Lenis is running, use it — otherwise fall back to native
      if (window.__lenis) {
        window.__lenis.scrollTo(targetTop, { duration: 1.0 });
      } else {
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      }
    });
  });
}

// ══════════════════════════════════════
//  PRODUCT SHOWCASE — State Manager
// ══════════════════════════════════════
 
function initProductShowcase() {
  const stage      = document.getElementById('showcaseStage');
  const scroller   = document.getElementById('showcaseScroller');
  const nameLabel  = document.getElementById('activeProductName');
  const prevBtn    = document.getElementById('prevBtn');
  const nextBtn    = document.getElementById('nextBtn');
 
  if (!stage || !scroller) return;
 
  const modelSlots = Array.from(stage.querySelectorAll('.model-slot'));
  const thumbCards = Array.from(scroller.querySelectorAll('.product-thumb'));
 
  if (!modelSlots.length) return;
 
  const total = modelSlots.length;
  let activeIndex = 0;
  let isAnimating = false;
 
  // ── Get product names from thumb cards ──
  function getProductName(index) {
    const card = thumbCards[index];
    if (!card) return '';
    return card.querySelector('.thumb-name')?.textContent || '';
  }
 
  // ── Assign slot classes based on active index ──
  function updateStage(newIndex, direction = 'next') {
    if (isAnimating) return;
    isAnimating = true;
 
    const prevIndex = (newIndex - 1 + total) % total;
    const nextIndex = (newIndex + 1) % total;
 
    modelSlots.forEach((slot, i) => {
      slot.classList.remove('active', 'prev', 'next', 'hidden');
 
      if (i === newIndex)    slot.classList.add('active');
      else if (i === prevIndex) slot.classList.add('prev');
      else if (i === nextIndex) slot.classList.add('next');
      else                   slot.classList.add('hidden');
    });
 
    // Update name pill
    if (nameLabel) {
      nameLabel.style.opacity = '0';
      setTimeout(() => {
        nameLabel.textContent = getProductName(newIndex);
        nameLabel.style.opacity = '1';
      }, 200);
    }
 
    // Update thumb cards
    thumbCards.forEach((card, i) => {
      card.classList.toggle('active', i === newIndex);
    });
 
    // Scroll active thumb into view
    const activeThumb = thumbCards[newIndex];
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
 
    activeIndex = newIndex;
 
    setTimeout(() => { isAnimating = false; }, 450); // matches CSS transition
  }
 
  // ── Thumb card clicks ──
  thumbCards.forEach((card) => {
    const handler = () => {
      const idx = parseInt(card.dataset.index, 10);
      if (idx !== activeIndex) updateStage(idx);
    };
    card.addEventListener('click', handler);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); }
    });
  });
 
  // ── Arrow buttons ──
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      updateStage((activeIndex - 1 + total) % total, 'prev');
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      updateStage((activeIndex + 1) % total, 'next');
    });
  }
 
  // ── Keyboard arrow support ──
  document.addEventListener('keydown', (e) => {
    if (!stage.closest('section')?.getBoundingClientRect) return;
    const rect = stage.closest('section').getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;
 
    if (e.key === 'ArrowLeft')  updateStage((activeIndex - 1 + total) % total, 'prev');
    if (e.key === 'ArrowRight') updateStage((activeIndex + 1) % total, 'next');
  });
 
  // ── Touch/swipe on stage ──
  let touchStartX = 0;
  stage.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
 
  stage.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) updateStage((activeIndex + 1) % total, 'next');
      else          updateStage((activeIndex - 1 + total) % total, 'prev');
    }
  }, { passive: true });
 
  // ── Initial render ──
  updateStage(0);
}
 
// ── Hook into existing DOMContentLoaded pattern ──
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProductShowcase);
} else {
  initProductShowcase();
}

// ══════════════════════════════════════
//  TESTIMONIALS SWIPER
// ══════════════════════════════════════
function initTestimonialsSwiper() {
  if (typeof Swiper === 'undefined') return;
  if (!document.querySelector('.testimonials-swiper')) return;

  new Swiper('.testimonials-swiper', {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    autoplay: {
      delay: 4500,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    breakpoints: {
      640: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },
  });
}

// ══════════════════════════════════════
//  INIT ALL
// ══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initStatsCountUp();
  initScrollReveal();
  initProcessLine();
  initSmoothScroll();
  initProductShowcase();
  initTestimonialsSwiper();
});