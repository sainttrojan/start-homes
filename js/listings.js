/**
 * Start Homes - Listings Page Logic (Supabase + LocalStorage Hybrid)
 */

const ListingsApp = {
  filters: {
    city: 'الكل',
    type: 'الكل',
    priceMin: 0,
    priceMax: Infinity,
    bedrooms: 'الكل',
    search: '',
    sort: 'newest'
  },
  currentPage: 1,
  pageSize: 6,
  allProperties: [],

  async init() {
    this.parseURLParams();
    this.bindEvents();
    try {
      if (window.DataService) {
        this.allProperties = await DataService.getProperties();
      } else {
        this.allProperties = typeof PROPERTIES_DATA !== 'undefined' ? PROPERTIES_DATA : [];
      }
    } catch (err) {
      console.error('Error fetching properties in ListingsApp:', err);
      this.allProperties = typeof PROPERTIES_DATA !== 'undefined' ? PROPERTIES_DATA : [];
    }
    this.render();
  },

  parseURLParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('city')) this.filters.city = params.get('city');
    if (params.has('type')) this.filters.type = params.get('type');
    if (params.has('beds')) this.filters.bedrooms = params.get('beds');
    if (params.has('priceMax')) this.filters.priceMax = Number(params.get('priceMax')) || Infinity;
    if (params.has('search')) this.filters.search = params.get('search');

    const citySelect = document.getElementById('filter-city');
    if (citySelect && this.filters.city) citySelect.value = this.filters.city;

    const typeSelect = document.getElementById('filter-type');
    if (typeSelect && this.filters.type) typeSelect.value = this.filters.type;

    const searchInput = document.getElementById('filter-search');
    if (searchInput && this.filters.search) searchInput.value = this.filters.search;
  },

  bindEvents() {
    // City filter
    document.getElementById('filter-city')?.addEventListener('change', (e) => {
      this.filters.city = e.target.value;
      this.currentPage = 1;
      this.render();
    });

    // Type filter
    document.getElementById('filter-type')?.addEventListener('change', (e) => {
      this.filters.type = e.target.value;
      this.currentPage = 1;
      this.render();
    });

    // Price range filters
    document.getElementById('filter-min-price')?.addEventListener('input', (e) => {
      this.filters.priceMin = Number(e.target.value) || 0;
      this.currentPage = 1;
      this.render();
    });

    document.getElementById('filter-max-price')?.addEventListener('input', (e) => {
      this.filters.priceMax = Number(e.target.value) || Infinity;
      this.currentPage = 1;
      this.render();
    });

    // Bedrooms filter
    const bedButtons = document.querySelectorAll('.bed-filter-btn');
    bedButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        bedButtons.forEach(b => {
          b.classList.remove('bg-primary-container/20', 'border-primary-container', 'text-primary-container', 'font-bold');
        });
        btn.classList.add('bg-primary-container/20', 'border-primary-container', 'text-primary-container', 'font-bold');
        this.filters.bedrooms = btn.getAttribute('data-beds');
        this.currentPage = 1;
        this.render();
      });
    });

    // Search input
    let searchDebounce;
    document.getElementById('filter-search')?.addEventListener('input', (e) => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        this.filters.search = e.target.value.trim();
        this.currentPage = 1;
        this.render();
      }, 300);
    });

    // Sorting
    document.getElementById('sort-select')?.addEventListener('change', (e) => {
      this.filters.sort = e.target.value;
      this.render();
    });

    // Reset filters
    document.getElementById('reset-filters-btn')?.addEventListener('click', () => {
      this.resetFilters();
    });

    document.getElementById('apply-filters-btn')?.addEventListener('click', () => {
      this.render();
      // Scroll to results on mobile
      if (window.innerWidth < 1024) {
        document.getElementById('properties-grid')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  },

  resetFilters() {
    this.filters = {
      city: 'الكل',
      type: 'الكل',
      priceMin: 0,
      priceMax: Infinity,
      bedrooms: 'الكل',
      search: '',
      sort: 'newest'
    };

    const cityEl = document.getElementById('filter-city');
    if (cityEl) cityEl.value = 'الكل';

    const typeEl = document.getElementById('filter-type');
    if (typeEl) typeEl.value = 'الكل';

    const minEl = document.getElementById('filter-min-price');
    if (minEl) minEl.value = '';

    const maxEl = document.getElementById('filter-max-price');
    if (maxEl) maxEl.value = '';

    const searchEl = document.getElementById('filter-search');
    if (searchEl) searchEl.value = '';

    const sortEl = document.getElementById('sort-select');
    if (sortEl) sortEl.value = 'newest';

    const bedButtons = document.querySelectorAll('.bed-filter-btn');
    bedButtons.forEach(b => {
      b.classList.remove('bg-primary-container/20', 'border-primary-container', 'text-primary-container', 'font-bold');
      if (b.getAttribute('data-beds') === 'الكل') {
        b.classList.add('bg-primary-container/20', 'border-primary-container', 'text-primary-container', 'font-bold');
      }
    });

    this.currentPage = 1;
    this.render();
  },

  getFilteredProperties() {
    let result = (this.allProperties || []).filter(item => {
      if (this.filters.city !== 'الكل' && !item.city.includes(this.filters.city)) return false;
      if (this.filters.type !== 'الكل' && item.type !== this.filters.type) return false;
      if (this.filters.bedrooms !== 'الكل') {
        if (this.filters.bedrooms === '4+' && item.bedrooms < 4) return false;
        if (this.filters.bedrooms !== '4+' && item.bedrooms !== Number(this.filters.bedrooms)) return false;
      }
      if (item.price < this.filters.priceMin) return false;
      if (item.price > this.filters.priceMax) return false;
      if (this.filters.search) {
        const query = this.filters.search.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchSubtitle = item.subtitle?.toLowerCase().includes(query);
        const matchDistrict = item.district?.toLowerCase().includes(query);
        const matchCity = item.city?.toLowerCase().includes(query);
        if (!matchTitle && !matchSubtitle && !matchDistrict && !matchCity) return false;
      }
      return true;
    });

    if (this.filters.sort === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (this.filters.sort === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (this.filters.sort === 'area-desc') {
      result.sort((a, b) => b.area - a.area);
    } else {
      result.sort((a, b) => Number(b.id) - Number(a.id));
    }

    return result;
  },

  render() {
    const list = this.getFilteredProperties();
    const container = document.getElementById('properties-grid');
    const countEl = document.getElementById('results-count');

    if (countEl) {
      countEl.textContent = `تم العثور على ${list.length} وحدة متميزة`;
    }

    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center bg-pure-white rounded-2xl border border-border-gray p-8">
          <span class="material-symbols-outlined text-6xl text-secondary mb-4">search_off</span>
          <h3 class="font-bold text-xl text-on-surface mb-2">لا توجد وحدات تطابق معايير البحث</h3>
          <p class="text-secondary text-sm mb-6 max-w-md mx-auto">جرب تقليل الفلاتر أو تغيير نطاق السعر والمنطقة للوصول لنتائج أكثر.</p>
          <button onclick="ListingsApp.resetFilters()" class="btn-primary px-6 py-2.5 rounded font-label-md">إعادة ضبط الفلاتر</button>
        </div>
      `;
      document.getElementById('pagination-container')?.classList.add('hidden');
      return;
    }

    const totalPages = Math.ceil(list.length / this.pageSize);
    if (this.currentPage > totalPages) this.currentPage = 1;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const pagedItems = list.slice(startIndex, startIndex + this.pageSize);

    container.innerHTML = pagedItems.map(item => {
      let badgeHtml = '';
      if (item.isDeal) {
        badgeHtml = `<div class="absolute top-4 right-4 bg-badge-gold-bg text-badge-gold-text px-3 py-1 rounded-full font-label-sm text-xs font-bold flex items-center gap-1 shadow-sm">
          <span class="material-symbols-outlined text-[14px]">local_fire_department</span> لقطة
        </div>`;
      } else if (item.isExclusive) {
        badgeHtml = `<div class="absolute top-4 right-4 bg-badge-gold-bg text-badge-gold-text px-3 py-1 rounded-full font-label-sm text-xs font-bold flex items-center gap-1 shadow-sm">
          <span class="material-symbols-outlined text-[14px]">star</span> حصرية
        </div>`;
      } else if (item.isNew) {
        badgeHtml = `<div class="absolute top-4 right-4 bg-badge-gold-bg text-badge-gold-text px-3 py-1 rounded-full font-label-sm text-xs font-bold flex items-center gap-1 shadow-sm">
          <span class="material-symbols-outlined text-[14px]">fiber_new</span> جديد
        </div>`;
      }

      return `
        <article class="property-card rounded-2xl overflow-hidden flex flex-col group">
          <div class="relative h-64 w-full img-zoom-container bg-surface-container-high">
            <img class="w-full h-full object-cover" src="${item.images[0]}" alt="${item.title}" loading="lazy">
            ${badgeHtml}
            <button class="fav-btn absolute top-4 left-4 w-9 h-9 rounded-full bg-pure-white/80 hover:bg-pure-white backdrop-blur-md flex items-center justify-center text-on-surface transition-all shadow-sm" data-id="${item.id}" title="حفظ في المفضلة">
              <span class="material-symbols-outlined text-[18px]">favorite</span>
            </button>
            <div class="absolute bottom-4 right-4 bg-on-surface/85 text-pure-white px-3 py-1 rounded backdrop-blur-sm font-label-sm text-xs">
              ${item.district || item.city}
            </div>
            <div class="absolute bottom-4 left-4 bg-primary-container text-on-primary-container px-2.5 py-0.5 rounded font-label-sm text-xs font-bold">
              ${item.type}
            </div>
          </div>

          <div class="p-6 flex flex-col flex-1">
            <h3 class="font-bold text-lg text-on-surface mb-1 line-clamp-1 group-hover:text-primary transition-colors">
              <a href="property-details.html?id=${item.id}">${item.title}</a>
            </h3>
            <p class="text-xs text-secondary mb-4 line-clamp-1 font-body-sm">${item.subtitle || item.description}</p>
            
            <div class="flex items-center justify-between text-secondary mb-4 text-xs border-y border-border-gray py-3 bg-surface-bright -mx-6 px-6 font-body-md">
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-primary text-sm">bed</span> ${item.bedrooms} غرف</span>
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-primary text-sm">bathtub</span> ${item.bathrooms} حمام</span>
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-primary text-sm">square_foot</span> ${item.area} م²</span>
            </div>

            <div class="mb-5 flex-1">
              <div class="text-xl font-bold text-on-surface font-headline-md">${formatEGP(item.price)}</div>
              <div class="text-xs text-secondary mt-1 flex justify-between">
                <span>المقدم: <strong class="text-on-surface">${formatEGP(item.downPayment)}</strong></span>
                <span class="text-primary font-bold">${item.installmentPlan}</span>
              </div>
            </div>

            <div class="flex gap-3 mt-auto">
              <a href="property-details.html?id=${item.id}" class="btn-secondary flex-1 py-2.5 rounded-lg text-center text-xs font-bold font-label-md flex items-center justify-center gap-1">
                <span>التفاصيل الكاملة</span>
                <span class="material-symbols-outlined text-base">arrow_back</span>
              </a>
              <button onclick="openWhatsAppLead('${item.title}', '${item.id}')" class="btn-primary w-12 flex items-center justify-center rounded-lg hover-gold-glow" title="تواصل واتساب">
                <span class="material-symbols-outlined text-lg">chat</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    this.renderPagination(totalPages);

    if (window.Favorites) {
      window.Favorites.initHeartButtons();
    }
  },

  renderPagination(totalPages) {
    const container = document.getElementById('pagination-container');
    if (!container) return;

    if (totalPages <= 1) {
      container.classList.add('hidden');
      return;
    }

    container.classList.remove('hidden');
    let html = `
      <button onclick="ListingsApp.changePage(${this.currentPage - 1})" ${this.currentPage === 1 ? 'disabled class="p-2 rounded-lg border border-border-gray text-secondary opacity-40 cursor-not-allowed"' : 'class="p-2 rounded-lg border border-border-gray text-on-surface hover:bg-surface-container transition-colors"'}>
        <span class="material-symbols-outlined text-lg">chevron_right</span>
      </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      html += `
        <button onclick="ListingsApp.changePage(${i})" class="w-9 h-9 rounded-lg font-bold text-xs transition-colors ${this.currentPage === i ? 'bg-primary-container text-on-primary-container' : 'border border-border-gray text-on-surface hover:bg-surface-container'}">
          ${i}
        </button>
      `;
    }

    html += `
      <button onclick="ListingsApp.changePage(${this.currentPage + 1})" ${this.currentPage === totalPages ? 'disabled class="p-2 rounded-lg border border-border-gray text-secondary opacity-40 cursor-not-allowed"' : 'class="p-2 rounded-lg border border-border-gray text-on-surface hover:bg-surface-container transition-colors"'}>
        <span class="material-symbols-outlined text-lg">chevron_left</span>
      </button>
    `;

    container.innerHTML = html;
  },

  changePage(page) {
    this.currentPage = page;
    this.render();
    window.scrollTo({ top: 200, behavior: 'smooth' });
  }
};

// Immediate initialization
if (typeof onReady === 'function') {
  onReady(() => ListingsApp.init());
} else if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ListingsApp.init());
} else {
  ListingsApp.init();
}
