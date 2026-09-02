/**
 * Start Homes - Core Application JavaScript
 */

// Theme Manager (Dark & Light Mode)
const ThemeManager = {
  KEY: 'start_homes_theme',

  init() {
    const savedTheme = localStorage.getItem(this.KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      this.applyTheme('dark');
    } else {
      this.applyTheme('light');
    }

    this.bindButtons();
  },

  applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    this.updateIcons(theme);
    localStorage.setItem(this.KEY, theme);
  },

  toggle() {
    const isDark = document.documentElement.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    this.applyTheme(newTheme);
    showToast(newTheme === 'dark' ? 'تم تفعيل الوضع الليلي (Dark Mode) 🌙' : 'تم تفعيل الوضع النهاري (Light Mode) ☀️', 'info');
  },

  updateIcons(theme) {
    const icons = document.querySelectorAll('.theme-toggle-icon');
    icons.forEach(icon => {
      icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
    });
  },

  bindButtons() {
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggle();
      });
    });
  }
};

// Toast notification helper
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let icon = 'info';
  if (type === 'success') icon = 'check_circle';
  if (type === 'error') icon = 'error';

  toast.innerHTML = `
    <span class="material-symbols-outlined text-primary text-xl">${icon}</span>
    <span class="text-sm font-medium flex-1">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Mobile Menu Toggle
function setupMobileMenu() {
  const menuToggle = document.querySelectorAll('.mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const drawerClose = document.getElementById('drawer-close');

  if (!mobileDrawer) return;

  function openDrawer() {
    mobileDrawer.classList.remove('translate-x-full');
    if (drawerBackdrop) drawerBackdrop.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    mobileDrawer.classList.add('translate-x-full');
    if (drawerBackdrop) drawerBackdrop.classList.add('hidden');
    document.body.style.overflow = '';
  }

  menuToggle.forEach(btn => btn.addEventListener('click', openDrawer));
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);
}

// Favorites Modal Handler
function setupFavoritesModal() {
  const favTriggers = document.querySelectorAll('.open-favorites-modal');
  const favModal = document.getElementById('favorites-modal');
  const favClose = document.getElementById('favorites-modal-close');
  const favBackdrop = document.getElementById('favorites-modal-backdrop');

  if (!favModal) return;

  function openModal() {
    if (window.Favorites) {
      window.Favorites.renderFavoritesModal();
    }
    favModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    favModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  favTriggers.forEach(btn => btn.addEventListener('click', openModal));
  if (favClose) favClose.addEventListener('click', closeModal);
  if (favBackdrop) favBackdrop.addEventListener('click', closeModal);
}

// Viewing Schedule Modal
function openViewingModal(propertyTitle = '') {
  const modal = document.getElementById('viewing-modal');
  if (!modal) return;
  const propInput = document.getElementById('viewing-property-title');
  if (propInput && propertyTitle) {
    propInput.value = propertyTitle;
  }
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeViewingModal() {
  const modal = document.getElementById('viewing-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

// WhatsApp Direct Lead Generator
function openWhatsAppLead(propertyTitle = 'استفسار عام عن عقارات ستارت هومز', propertyId = '') {
  const phone = '201099887766';
  const text = encodeURIComponent(`مرحباً ستارت هومز، أود الاستفسار وتحديد موعد معاينة بخصوص:\n🏠 ${propertyTitle}${propertyId ? `\n🔗 كود الوحدة: #${propertyId}` : ''}`);
  window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
}

// Handle Home Hero Search
function handleHeroSearch(event) {
  event.preventDefault();
  const city = document.getElementById('hero-city')?.value || '';
  const type = document.getElementById('hero-type')?.value || '';
  const beds = document.getElementById('hero-beds')?.value || '';
  const price = document.getElementById('hero-price')?.value || '';

  const params = new URLSearchParams();
  if (city && city !== 'اختر المنطقة' && city !== 'الكل') params.set('city', city);
  if (type && type !== 'اختر نوع الوحدة' && type !== 'الكل') params.set('type', type);
  if (beds && beds !== 'الكل') params.set('beds', beds);
  if (price && price !== 'أي سعر') params.set('priceMax', price);

  window.location.href = `latest-units.html?${params.toString()}`;
}

// Global initialization
if (typeof onReady === 'function') {
  onReady(initApp);
} else if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function initApp() {
  ThemeManager.init();
  setupMobileMenu();
  setupFavoritesModal();

  // Viewing Modal Form Submission
  const viewingForm = document.getElementById('viewing-form');
  if (viewingForm) {
    viewingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const inquiryData = {
        propertyTitle: document.getElementById('viewing-property-title')?.value || 'طلب معاينة',
        clientName: viewingForm.querySelector('input[placeholder*="اسم"]')?.value || '',
        clientPhone: viewingForm.querySelector('input[type="tel"]')?.value || '',
        preferredDate: viewingForm.querySelector('input[type="date"]')?.value || ''
      };

      if (window.DataService) {
        await DataService.saveInquiry(inquiryData);
      }

      showToast('تم إرسال طلب المعاينة بنجاح! سيتواصل معك مستشارنا خلال دقائق.', 'success');
      closeViewingModal();
      viewingForm.reset();
    });
  }

  // Subscribe Alerts Modal Form
  const alertsForm = document.getElementById('deals-alert-form');
  if (alertsForm) {
    alertsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('تم تفعيل تنبيهات لقطات الريسيل بنجاح!', 'success');
      const modal = document.getElementById('deals-alert-modal');
      if (modal) modal.classList.add('hidden');
      alertsForm.reset();
    });
  }
}
