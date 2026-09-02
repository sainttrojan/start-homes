/**
 * Start Homes - Real Estate Properties Data Model & Formatter Utilities
 */

const PROPERTIES_DATA = [];

// Helper functions for format & display
function formatEGP(number) {
  const n = Number(number);
  if (isNaN(n) || number === null || number === undefined) return '0 ج.م';
  try {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0
    }).format(n);
  } catch (e) {
    return `${n} ج.م`;
  }
}

function getPropertyById(id) {
  return PROPERTIES_DATA.find(p => String(p.id) === String(id)) || null;
}

function onReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    setTimeout(fn, 1);
  }
}

if (typeof window !== 'undefined') {
  window.PROPERTIES_DATA = PROPERTIES_DATA;
  window.formatEGP = formatEGP;
  window.getPropertyById = getPropertyById;
  window.onReady = onReady;
}
