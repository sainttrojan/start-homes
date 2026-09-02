/**
 * Start Homes - Property Details Page Logic (Supabase + LocalStorage Hybrid)
 */

const PropertyDetailsApp = {
  currentProperty: null,
  activeImageIndex: 0,
  allProperties: [],

  async init() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    try {
      if (window.DataService) {
        this.allProperties = await DataService.getProperties();
        if (id) {
          this.currentProperty = await DataService.getPropertyById(id);
        } else if (this.allProperties && this.allProperties.length > 0) {
          this.currentProperty = this.allProperties[0];
        }
      } else {
        this.allProperties = typeof PROPERTIES_DATA !== 'undefined' ? PROPERTIES_DATA : [];
        this.currentProperty = id ? this.allProperties.find(p => String(p.id) === String(id)) : this.allProperties[0];
      }

      if (!this.currentProperty && this.allProperties && this.allProperties.length > 0) {
        this.currentProperty = this.allProperties[0];
      }

      if (!this.currentProperty) {
        this.renderEmptyState();
        return;
      }

      this.render();
      this.renderSimilarListings();
    } catch (err) {
      console.error('Error initializing PropertyDetailsApp:', err);
    }
  },

  renderEmptyState() {
    const mainEl = document.querySelector('main');
    if (!mainEl) return;
    mainEl.innerHTML = `
      <div class="max-w-xl mx-auto py-24 text-center bg-pure-white rounded-3xl border border-border-gray p-10 shadow-sm">
        <span class="material-symbols-outlined text-6xl text-secondary mb-4">apartment</span>
        <h2 class="text-2xl font-black text-on-surface mb-2">لم يتم العثور على هذا العقار</h2>
        <p class="text-sm text-secondary mb-6">قد يكون العقار تم بيعه أو غير متوفر حالياً. يمكنك تصفح باقي الوحدات المتاحة.</p>
        <div class="flex justify-center gap-3">
          <a href="latest-units.html" class="btn-primary px-6 py-3 rounded-xl text-xs font-bold">تصفح أحدث الوحدات</a>
          <a href="index.html" class="btn-secondary px-6 py-3 rounded-xl text-xs font-bold">الرئيسية</a>
        </div>
      </div>
    `;
  },

  render() {
    const prop = this.currentProperty;
    if (!prop) return;

    // Document Title
    document.title = `${prop.title} | Start Homes`;

    // Breadcrumbs
    const bcCity = document.getElementById('bc-city');
    const bcTitle = document.getElementById('bc-title');
    if (bcCity) bcCity.textContent = prop.city || 'أحدث الوحدات';
    if (bcTitle) bcTitle.textContent = prop.title || 'تفاصيل العقار';

    // Title & Subtitle
    const titleEl = document.getElementById('prop-title');
    const subtitleEl = document.getElementById('prop-subtitle');
    if (titleEl) titleEl.textContent = prop.title || 'وحدة سكنية مميزة';
    if (subtitleEl) subtitleEl.textContent = prop.subtitle || `${prop.city} - ${prop.district}`;

    // Price & Terms
    const priceEl = document.getElementById('prop-price');
    const downPaymentEl = document.getElementById('prop-downpayment');
    const planEl = document.getElementById('prop-plan');
    if (priceEl) priceEl.textContent = formatEGP(prop.price);
    if (downPaymentEl) downPaymentEl.textContent = formatEGP(prop.downPayment);
    if (planEl) planEl.textContent = prop.installmentPlan || 'كاش';

    // Gallery Main Image
    const mainImg = document.getElementById('gallery-main-img');
    const imagesList = prop.images && prop.images.length > 0 ? prop.images : [DEFAULT_PROPERTY_IMAGE];
    
    if (mainImg) {
      mainImg.src = imagesList[0];
      mainImg.alt = prop.title;
    }

    // Gallery Thumbnails
    const thumbsContainer = document.getElementById('gallery-thumbnails');
    if (thumbsContainer) {
      thumbsContainer.innerHTML = imagesList.map((imgUrl, idx) => `
        <div onclick="PropertyDetailsApp.switchImage(${idx})" class="aspect-video rounded-lg border-2 ${idx === 0 ? 'border-primary' : 'border-border-gray'} overflow-hidden cursor-pointer hover:border-primary-container transition-all relative">
          <img class="w-full h-full object-cover" src="${imgUrl}" alt="صورة ${idx + 1}">
          ${idx === 3 && imagesList.length > 4 ? `<div class="absolute inset-0 flex items-center justify-center bg-inverse-surface/60 text-pure-white font-bold text-xs">+${imagesList.length - 4} صور</div>` : ''}
        </div>
      `).join('');
    }

    // Specs Grid
    const specsBeds = document.getElementById('spec-beds');
    const specsBaths = document.getElementById('spec-baths');
    const specsFloor = document.getElementById('spec-floor');
    const specsFinishing = document.getElementById('spec-finishing');
    const specsElevator = document.getElementById('spec-elevator');
    const specsArea = document.getElementById('spec-area');
    const specsView = document.getElementById('spec-view');

    if (specsBeds) specsBeds.textContent = `${prop.bedrooms || 3} غرف نوم`;
    if (specsBaths) specsBaths.textContent = `${prop.bathrooms || 2} حمام`;
    if (specsFloor) specsFloor.textContent = prop.floor || 'الدور الثاني';
    if (specsFinishing) specsFinishing.textContent = prop.finishing || 'سوبر لوكس';
    if (specsElevator) specsElevator.textContent = prop.elevator ? 'يوجد مصعد' : 'بدون مصعد';
    if (specsArea) specsArea.textContent = `${prop.area || 140} م²`;
    if (specsView) specsView.textContent = prop.viewType || 'إطلالة مفتوحة';

    // Description
    const descEl = document.getElementById('prop-description');
    if (descEl) {
      descEl.textContent = prop.description || 'وحدة سكنية فاخرة معروضة للبيع عبر منصة Start Homes مع فحص قانوني وتسهيلات سداد.';
    }

    // Amenities
    const amenitiesContainer = document.getElementById('prop-amenities');
    if (amenitiesContainer) {
      const amList = prop.amenities && prop.amenities.length > 0 ? prop.amenities : [
        "فحص قانوني معتمد 100%",
        "تسليم فوري ومعاينة متاحة",
        "موقع متميز قريب من الخدمات",
        "تسهيلات في السداد والتعاقد"
      ];
      amenitiesContainer.innerHTML = amList.map(am => `
        <li class="flex items-center gap-2 text-on-surface-variant font-medium text-sm">
          <span class="material-symbols-outlined text-primary text-base">check_circle</span>
          <span>${am}</span>
        </li>
      `).join('');
    }

    // WhatsApp Direct Buttons
    const waButtons = document.querySelectorAll('.prop-wa-lead-btn');
    waButtons.forEach(btn => {
      btn.onclick = () => openWhatsAppLead(prop.title, prop.id);
    });

    // Schedule Viewing Buttons
    const viewButtons = document.querySelectorAll('.prop-schedule-view-btn');
    viewButtons.forEach(btn => {
      btn.onclick = () => openViewingModal(prop.title);
    });

    // Phone Call Buttons
    const callButtons = document.querySelectorAll('.prop-call-btn');
    callButtons.forEach(btn => {
      btn.onclick = () => {
        window.location.href = `tel:19xxx`;
      };
    });

    // Favorite button
    const favBtn = document.getElementById('prop-fav-btn');
    if (favBtn) {
      favBtn.setAttribute('data-id', prop.id);
    }
  },

  switchImage(index) {
    this.activeImageIndex = index;
    const prop = this.currentProperty;
    if (!prop) return;
    const imagesList = prop.images && prop.images.length > 0 ? prop.images : [DEFAULT_PROPERTY_IMAGE];
    const mainImg = document.getElementById('gallery-main-img');
    if (mainImg && imagesList[index]) {
      mainImg.src = imagesList[index];
    }

    // Update borders
    const thumbs = document.querySelectorAll('#gallery-thumbnails > div');
    thumbs.forEach((th, idx) => {
      if (idx === index) {
        th.classList.remove('border-border-gray');
        th.classList.add('border-primary');
      } else {
        th.classList.remove('border-primary');
        th.classList.add('border-border-gray');
      }
    });
  },

  openLightbox() {
    const prop = this.currentProperty;
    if (!prop) return;
    const imagesList = prop.images && prop.images.length > 0 ? prop.images : [DEFAULT_PROPERTY_IMAGE];
    const modal = document.getElementById('gallery-lightbox');
    const img = document.getElementById('lightbox-img');
    const counter = document.getElementById('lightbox-counter');

    if (!modal || !img) return;

    img.src = imagesList[this.activeImageIndex] || imagesList[0];
    if (counter) counter.textContent = `${this.activeImageIndex + 1} / ${imagesList.length}`;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  closeLightbox() {
    const modal = document.getElementById('gallery-lightbox');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  },

  lightboxNext() {
    const prop = this.currentProperty;
    if (!prop) return;
    const imagesList = prop.images && prop.images.length > 0 ? prop.images : [DEFAULT_PROPERTY_IMAGE];
    this.activeImageIndex = (this.activeImageIndex + 1) % imagesList.length;
    this.switchImage(this.activeImageIndex);
    this.openLightbox();
  },

  lightboxPrev() {
    const prop = this.currentProperty;
    if (!prop) return;
    const imagesList = prop.images && prop.images.length > 0 ? prop.images : [DEFAULT_PROPERTY_IMAGE];
    this.activeImageIndex = (this.activeImageIndex - 1 + imagesList.length) % imagesList.length;
    this.switchImage(this.activeImageIndex);
    this.openLightbox();
  },

  renderSimilarListings() {
    const prop = this.currentProperty;
    const container = document.getElementById('similar-listings-grid');
    if (!container) return;

    const similar = (this.allProperties || [])
      .filter(p => String(p.id) !== String(prop.id))
      .slice(0, 3);

    if (similar.length === 0) {
      const section = container.closest('section');
      if (section) section.classList.add('hidden');
      return;
    }

    container.innerHTML = similar.map(item => `
      <div class="bg-pure-white rounded-xl border border-border-gray overflow-hidden hover:border-primary-container transition-all hover-gold-glow flex flex-col group">
        <div class="aspect-video relative img-zoom-container bg-surface-container-high">
          <img class="w-full h-full object-cover" src="${item.images[0]}" alt="${item.title}">
          <div class="absolute top-2 right-2">
            <span class="bg-badge-gold-bg text-badge-gold-text px-2.5 py-1 rounded-full font-label-sm text-[11px] font-bold">
              ${item.isDeal ? 'لقطة' : 'استلام فوري'}
            </span>
          </div>
        </div>
        <div class="p-4 flex flex-col flex-grow">
          <h4 class="font-bold text-on-surface mb-1 text-sm line-clamp-1 group-hover:text-primary transition-colors">
            <a href="property-details.html?id=${item.id}">${item.title}</a>
          </h4>
          <p class="text-primary font-bold mb-3 text-base">${formatEGP(item.price)}</p>
          <div class="flex gap-4 text-secondary text-xs mt-auto border-t border-border-gray pt-3">
            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">bed</span> ${item.bedrooms} غرف</span>
            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">bathtub</span> ${item.bathrooms} حمام</span>
            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">square_foot</span> ${item.area} م²</span>
          </div>
        </div>
      </div>
    `).join('');
  }
};

// Immediate initialization
if (typeof onReady === 'function') {
  onReady(() => PropertyDetailsApp.init());
} else if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => PropertyDetailsApp.init());
} else {
  PropertyDetailsApp.init();
}
