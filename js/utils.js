// ══════════════════════════════════════
//  VALIDATION HELPERS
// ══════════════════════════════════════

/**
 * Validate Indian mobile number
 * Must start with 6-9, exactly 10 digits
 */
export function validatePhone(phone) {
  const cleaned = phone.replace(/\s|-/g, '');
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Validate name — letters and spaces only, 2–50 chars
 */
export function validateName(name) {
  return /^[a-zA-Z\s]{2,50}$/.test(name.trim());
}

/**
 * Validate quantity — integer >= 1
 */
export function validateQuantity(qty) {
  const num = parseInt(qty, 10);
  return !isNaN(num) && num >= 1;
}

/**
 * Strip HTML tags from a string — XSS prevention
 */
export function stripHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Truncate string to max length
 */
export function truncate(str, max = 500) {
  return str.length > max ? str.slice(0, max) : str;
}

/**
 * Format phone number for display
 */
export function formatPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}

// ══════════════════════════════════════
//  DOM HELPERS
// ══════════════════════════════════════

/**
 * Show inline field error
 */
export function showError(errorElementId, message) {
  const el = document.getElementById(errorElementId);
  if (el) {
    el.textContent = message;
    el.style.display = 'block';
    el.closest('.form-group')?.classList.add('has-error');
  }
}

/**
 * Clear inline field error
 */
export function clearError(errorElementId) {
  const el = document.getElementById(errorElementId);
  if (el) {
    el.textContent = '';
    el.style.display = 'none';
    el.closest('.form-group')?.classList.remove('has-error');
  }
}

/**
 * Clear all form errors
 */
export function clearAllErrors(errorIds) {
  errorIds.forEach(id => clearError(id));
}

/**
 * Scroll to first element with error
 */
export function scrollToFirstError() {
  const firstError = document.querySelector('.has-error');
  if (firstError) {
    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// ══════════════════════════════════════
//  TOAST NOTIFICATION
// ══════════════════════════════════════

/**
 * Show a toast message
 * @param {string} message
 * @param {'success'|'error'} type
 * @param {number} duration ms
 */
export function showToast(message, type = 'success', duration = 3500) {
  // Remove any existing toast
  const existing = document.getElementById('siteToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'siteToast';
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');

  const icon = type === 'success' ? '✓' : '⚠';
  toast.textContent = `${icon} ${message}`;

  document.body.appendChild(toast);

  // Trigger show
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
  });

  // Auto hide
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// ══════════════════════════════════════
//  COUNT-UP ANIMATION
// ══════════════════════════════════════

/**
 * Animate a number counting up
 * @param {HTMLElement} el
 * @param {number} target
 * @param {number} duration ms
 */
export function countUp(el, target, duration = 1800) {
  let start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);

    el.textContent = current.toLocaleString('en-IN');

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target.toLocaleString('en-IN');
    }
  }

  requestAnimationFrame(update);
}