import {
  validatePhone,
  validateName,
  stripHTML,
  truncate,
  showError,
  clearError,
  clearAllErrors,
  scrollToFirstError,
  showToast,
} from './utils.js';

// ══════════════════════════════════════
//  STATE
// ══════════════════════════════════════
const state = {
  selectedColor:      '',
  selectedColorName:  '',
  customColors:       [],   // array of { id, name } — supports multiple custom colours
  matrixData:         {},
};

// ══════════════════════════════════════
//  SIZES
// ══════════════════════════════════════
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'];

// ══════════════════════════════════════
//  COLOUR SWATCHES
// ══════════════════════════════════════
function initSwatches() {
  const swatches    = document.querySelectorAll('.swatch');
  const colorLabel  = document.getElementById('colorName');
  const mainImage   = document.getElementById('mainProductImage');
  const customPanel = document.getElementById('customColorPanel');

  if (!swatches.length) return;

  const firstReal = Array.from(swatches).find(s => s.dataset.color !== 'custom');
  if (firstReal) activateSwatch(firstReal, colorLabel, mainImage, customPanel);

  swatches.forEach(swatch => {
    swatch.addEventListener('click', () =>
      activateSwatch(swatch, colorLabel, mainImage, customPanel)
    );
  });
}

function activateSwatch(swatch, colorLabel, mainImage, customPanel) {

  document
    .querySelectorAll('.swatch')
    .forEach(s => s.classList.remove('active'));

  swatch.classList.add('active');

  state.selectedColor =
    swatch.dataset.color || '';

  state.selectedColorName =
    swatch.dataset.colorName || '';

  if (colorLabel) {
    colorLabel.textContent =
      state.selectedColorName;
  }

  const isCustom =
    swatch.dataset.color === 'custom';

  if (customPanel) {
    customPanel.style.display =
      isCustom ? 'block' : 'none';
  }

  if (!isCustom) {
    updateGalleryImages(
      state.selectedColor
    );
  }

}

function updateGalleryImages(color) {

  const productFolder =
    document.body.dataset.product;

  const mainImage =
    document.getElementById('mainProductImage');

  const thumbs =
    document.querySelectorAll('.gallery-thumb img');

  if (!mainImage || thumbs.length < 4) return;

  const base =
    `../images/products/${productFolder}/${color}`;

  mainImage.dataset.userChanged = '';

  mainImage.src =
    `${base}/main.png`;

  thumbs[0].src =
    `${base}/front.png`;

  thumbs[0].dataset.full =
    `${base}/front.png`;

  thumbs[1].src =
    `${base}/back.png`;

  thumbs[1].dataset.full =
    `${base}/back.png`;

  thumbs[2].src =
    `${base}/fabric-closeup.png`;

  thumbs[2].dataset.full =
    `${base}/fabric-closeup.png`;

  thumbs[3].src =
    `${base}/logo-embroidery.png`;

  thumbs[3].dataset.full =
    `${base}/logo-embroidery.png`;

  document
    .querySelectorAll('.gallery-thumb')
    .forEach(t =>
      t.classList.remove('active')
    );

  document
    .querySelector('.gallery-thumb')
    ?.classList.add('active');

}


// ══════════════════════════════════════
//  GALLERY SWIPER
// ══════════════════════════════════════
function initGallerySwiper() {

  const mainImage =
    document.getElementById('mainProductImage');

  if (!mainImage) return;

  document
    .querySelectorAll('.gallery-thumb')
    .forEach(thumb => {

      thumb.addEventListener('click', () => {

        const img =
          thumb.querySelector('img');

        if (!img) return;

        mainImage.dataset.userChanged = 'true';

        mainImage.style.opacity = '0';

        setTimeout(() => {

          mainImage.src =
            img.dataset.full || img.src;

          mainImage.style.opacity = '1';

        }, 150);

        document
          .querySelectorAll('.gallery-thumb')
          .forEach(t =>
            t.classList.remove('active')
          );

        thumb.classList.add('active');

      });

    });

}

// ══════════════════════════════════════
//  CUSTOM COLOUR — supports multiple
// ══════════════════════════════════════
function initCustomColor() {
  const customInput = document.getElementById('customColorInput');
  const addBtn      = document.getElementById('confirmCustomColor');

  if (!customInput || !addBtn) return;

  addBtn.addEventListener('click', () => {
    const val = customInput.value.trim();
    if (!val) {
      showToast('Please enter a colour name or Pantone code.', 'error');
      return;
    }

    // Prevent exact duplicate
    const isDuplicate = state.customColors.some(
      c => c.name.toLowerCase() === val.toLowerCase()
    );
    if (isDuplicate) {
      showToast(`"${val}" is already in the matrix.`, 'error');
      return;
    }

    // Add to custom colours list
    const id = `custom_${Date.now()}`;
    state.customColors.push({ id, name: val });

    // Rebuild matrix (preserves all existing values)
    buildMatrix();

    // Show tag in custom list
    renderCustomColorTags();

    customInput.value = '';
    showToast(`"${val}" added as a new colour column.`, 'success');
  });

  // Allow Enter key
  customInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addBtn.click(); }
  });
}

function renderCustomColorTags() {
  const container = document.getElementById('customColorTags');
  if (!container) return;

  container.innerHTML = '';
  state.customColors.forEach(c => {
    const tag = document.createElement('span');
    tag.className = 'custom-color-tag';
    tag.innerHTML = `${c.name} <button class="tag-remove" data-id="${c.id}" title="Remove">×</button>`;
    container.appendChild(tag);
  });

  // Remove button logic
  container.querySelectorAll('.tag-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      state.customColors = state.customColors.filter(c => c.id !== id);
      // Clear matrixData rows for this colour
      const removed = state.customColors; // already filtered
      // Find name before removing
      const name = btn.closest('.custom-color-tag').textContent.replace('×','').trim();
      Object.keys(state.matrixData).forEach(key => {
        if (key.includes(`|${name}`)) delete state.matrixData[key];
      });
      buildMatrix();
      renderCustomColorTags();
    });
  });
}

// ══════════════════════════════════════
//  BULK MATRIX
// ══════════════════════════════════════
function getRealColors() {
  const swatches = document.querySelectorAll('.swatch:not([data-color="custom"])');
  const colors = [];
  swatches.forEach(s => {
    colors.push({
      color:    s.dataset.color,
      name:     s.dataset.colorName || s.dataset.color,
      bg:       s.style.background  || '#ccc',
      isCustom: false,
    });
  });
  return colors;
}

function getAllMatrixColors() {
  const real = getRealColors();
  state.customColors.forEach(c => {
    real.push({
      color:    c.id,
      name:     c.name,
      bg:       'linear-gradient(135deg,#6ee7b7,#3b82f6,#a78bfa)',
      isCustom: true,
    });
  });
  return real;
}

function buildMatrix() {
  const table = document.getElementById('bulkMatrix');
  if (!table) return;

  const colors   = getAllMatrixColors();
  const preserved = { ...state.matrixData };

  // ── Header ──
  let thead = table.querySelector('thead');
  if (!thead) { thead = document.createElement('thead'); table.appendChild(thead); }
  thead.innerHTML = '';

  const trHead = document.createElement('tr');

  const thSize = document.createElement('th');
  thSize.textContent = 'Size';
  trHead.appendChild(thSize);

  colors.forEach(c => {
    const th = document.createElement('th');
    if (c.isCustom) th.classList.add('custom-col');

    const dot = document.createElement('span');
    dot.className   = 'matrix-color-dot';
    dot.style.background = c.bg;
    th.appendChild(dot);
    th.appendChild(document.createTextNode(' ' + c.name));
    trHead.appendChild(th);
  });

  const thTotal = document.createElement('th');
  thTotal.textContent = 'Row Total';
  thTotal.className   = 'col-total';
  trHead.appendChild(thTotal);

  thead.appendChild(trHead);

  // ── Body ──
  let tbody = table.querySelector('tbody');
  if (!tbody) { tbody = document.createElement('tbody'); table.appendChild(tbody); }
  tbody.innerHTML = '';
  state.matrixData = {};

  SIZES.forEach(size => {
    const tr = document.createElement('tr');

    const tdSize = document.createElement('td');
    tdSize.className   = 'size-label';
    tdSize.textContent = size;
    tr.appendChild(tdSize);

    colors.forEach(c => {
      const td    = document.createElement('td');
      const input = document.createElement('input');
      input.type        = 'number';
      input.min         = '0';
      input.value       = '';
      input.placeholder = '0';
      input.className   = 'matrix-qty';
      input.dataset.size      = size;
      input.dataset.color     = c.color;
      input.dataset.colorName = c.name;
      input.setAttribute('aria-label', `Qty ${size} / ${c.name}`);

      const key = `${size}|${c.name}`;
      if (preserved[key]) {
        input.value = preserved[key];
        state.matrixData[key] = preserved[key];
      }

      input.addEventListener('input', () => {
        const val = parseInt(input.value, 10);
        state.matrixData[key] = (isNaN(val) || val < 0) ? 0 : val;
        updateTotals();
      });

      td.appendChild(input);
      tr.appendChild(td);
    });

    const tdRow = document.createElement('td');
    tdRow.className    = 'row-total';
    tdRow.dataset.size = size;
    tdRow.textContent  = '0';
    tr.appendChild(tdRow);

    tbody.appendChild(tr);
  });

  // ── Grand total row ──
  const trGrand = document.createElement('tr');
  trGrand.className = 'grand-total-row';

  const tdLabel = document.createElement('td');
  tdLabel.className   = 'size-label';
  tdLabel.textContent = 'COL TOTAL';
  trGrand.appendChild(tdLabel);

  colors.forEach(c => {
    const td = document.createElement('td');
    td.className          = 'col-total-cell';
    td.dataset.colorTotal = c.color;
    td.textContent        = '0';
    trGrand.appendChild(td);
  });

  const tdGrand = document.createElement('td');
  tdGrand.className   = 'grand-total-cell';
  tdGrand.textContent = '0';
  trGrand.appendChild(tdGrand);

  tbody.appendChild(trGrand);

  updateTotals();
}

function updateTotals() {
  const table = document.getElementById('bulkMatrix');
  if (!table) return;

  const inputs = table.querySelectorAll('.matrix-qty');
  const colors = getAllMatrixColors();
  let grand    = 0;

  SIZES.forEach(size => {
    let rowTotal = 0;
    inputs.forEach(inp => {
      if (inp.dataset.size === size) rowTotal += parseInt(inp.value || 0, 10) || 0;
    });
    const cell = table.querySelector(`.row-total[data-size="${size}"]`);
    if (cell) cell.textContent = rowTotal;
    grand += rowTotal;
  });

  colors.forEach(c => {
    let colTotal = 0;
    inputs.forEach(inp => {
      if (inp.dataset.color === c.color) colTotal += parseInt(inp.value || 0, 10) || 0;
    });
    const cell = table.querySelector(`.col-total-cell[data-color-total="${c.color}"]`);
    if (cell) cell.textContent = colTotal;
  });

  const grandCell = table.querySelector('.grand-total-cell');
  if (grandCell) grandCell.textContent = grand;

  const badge = document.getElementById('totalUnits');
  if (badge) badge.textContent = grand;
}

function initBulkMatrix() {
  if (!document.getElementById('bulkMatrix')) return;
  buildMatrix();
}

// ══════════════════════════════════════
//  BUILD WHATSAPP MESSAGE
// ══════════════════════════════════════
function buildMatrixLines() {
  const byColor = {};
  let hasAny    = false;

  Object.entries(state.matrixData).forEach(([key, qty]) => {
    if (qty > 0) {
      const [size, colorName] = key.split('|');
      if (!byColor[colorName]) byColor[colorName] = [];
      byColor[colorName].push(`${size}: ${qty}`);
      hasAny = true;
    }
  });

  if (!hasAny) return null;

  return Object.entries(byColor)
    .map(([colorName, sizes]) => `  *${colorName}* — ${sizes.join(', ')}`)
    .join('\n');
}

// ══════════════════════════════════════
//  ORDER SUBMIT
// ══════════════════════════════════════
function initOrderForm() {
  const orderBtn = document.getElementById('orderBtn');
  if (!orderBtn) return;

  ['orderName', 'orderPhone'].forEach(id => {
    const el    = document.getElementById(id);
    const errId = id === 'orderName' ? 'nameError' : 'phoneError';
    if (el) {
      el.addEventListener('input',  () => clearError(errId));
      el.addEventListener('change', () => clearError(errId));
    }
  });

  orderBtn.addEventListener('click', handleOrderSubmit);
}

function handleOrderSubmit() {
  const nameInput  = document.getElementById('orderName');
  const phoneInput = document.getElementById('orderPhone');
  const cityInput  = document.getElementById('orderCity');
  const notesInput = document.getElementById('orderNotes');

  clearAllErrors(['nameError', 'phoneError']);

  let isValid = true;

  if (!nameInput || !validateName(nameInput.value)) {
    showError('nameError', 'Please enter your full name (letters only, 2–50 chars).');
    isValid = false;
  }
  if (!phoneInput || !validatePhone(phoneInput.value)) {
    showError('phoneError', 'Please enter a valid 10-digit Indian mobile number.');
    isValid = false;
  }

  const matrixLines   = buildMatrixLines();
  const customNames   = state.customColors.map(c => c.name).join(', ');
  const hasCustomOnly = !matrixLines && customNames;
  const hasMatrix     = !!matrixLines;

  if (!hasMatrix && !hasCustomOnly) {
    showToast('Please enter at least one quantity in the order matrix.', 'error');
    document.getElementById('bulkMatrix')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  if (!isValid) { scrollToFirstError(); return; }

  const product    = document.getElementById('productName')?.textContent || 'Product';
  const name       = stripHTML(nameInput.value.trim());
  const phone      = phoneInput.value.trim();
  const city       = cityInput  ? stripHTML(cityInput.value.trim())  : '';
  const notes      = notesInput ? truncate(stripHTML(notesInput.value.trim()), 500) : '';
  const totalUnits = Object.values(state.matrixData).reduce((a, b) => a + b, 0);

  let breakdownBlock  = matrixLines ? `*Order Breakdown (Size × Colour):*\n${matrixLines}` : '';
  let customColorLine = customNames ? `\n*Custom Colour(s):* ${customNames}` : '';

  const message =
`Hello New Star Enterprises! 🏥

I'd like to place a bulk order:

*Product:* ${product}
*Total Units:* ${totalUnits || '(custom colour — see below)'}

${breakdownBlock}${customColorLine}

*My Details:*
*Name:* ${name}
*Phone:* ${phone}
*City / State:* ${city || 'Not specified'}
*Notes:* ${notes || 'None'}

Please confirm pricing and delivery timeline.
Thank you!`;

  const waURL = `https://wa.me/919940666626?text=${encodeURIComponent(message)}`;
  showToast('Opening WhatsApp with your order details...', 'success');
  setTimeout(() => window.open(waURL, '_blank'), 800);
}

// ══════════════════════════════════════
//  SAMPLE REQUEST
// ══════════════════════════════════════
function initSampleRequest() {
  const sampleBtn = document.getElementById('sampleBtn');
  if (!sampleBtn) return;

  sampleBtn.addEventListener('click', () => {
    const product    = document.getElementById('productName')?.textContent || 'Product';
    const name       = document.getElementById('orderName')?.value.trim()  || '';
    const phone      = document.getElementById('orderPhone')?.value.trim() || '';
    const customList = state.customColors.map(c => c.name).join(', ');

    const colourNote = customList
      ? `Preferred Colour(s): ${customList} (custom)`
      : state.selectedColorName
        ? `Preferred Colour: ${state.selectedColorName}`
        : '';

    const message =
`Hello New Star Enterprises! 🏥

I'd like to request a *physical sample* before placing a bulk order.

*Product:* ${product}
${colourNote ? `*${colourNote}*\n` : ''}
*My Name:* ${name || '(please advise)'}
*My Phone:* ${phone || '(please advise)'}

Could you please let me know sample availability, lead time, and shipping charges?
Thank you!`;

    const waURL = `https://wa.me/919940666626?text=${encodeURIComponent(message)}`;
    showToast('Opening WhatsApp for sample request...', 'success');
    setTimeout(() => window.open(waURL, '_blank'), 600);
  });
}

// ══════════════════════════════════════
//  INIT ALL
// ══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initSwatches();
  initGallerySwiper();
  initBulkMatrix();
  initCustomColor();
  initOrderForm();
  initSampleRequest();
});