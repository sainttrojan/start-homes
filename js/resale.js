/**
 * Start Homes - Resale Deals Page Logic (Supabase + LocalStorage Hybrid)
 */

const ResaleApp = {
  currentCity: 'الكل',
  allProperties: [],

  async init() {
    this.bindTabs();
    try {
      if (window.DataService) {
        this.allProperties = await DataService.getProperties();
      } else {
        this.allProperties = typeof PROPERTIES_DATA !== 'undefined' ? PROPERTIES_DATA : [];
      }
    } catch (err) {
      console.error('Error in ResaleApp:', err);
      this.allProperties = typeof PROPERTIES_DATA !== 'undefined' ? PROPERTIES_DATA : [];
    }
    this.render();
  },

  bindTabs() {
    const tabs = document.querySelectorAll('.deal-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('bg-primary-container', 'text-on-primary-container', 'font-bold');
          t.classList.add('text-secondary', 'hover:bg-surface-container');
        });
        tab.classList.add('bg-primary-container', 'text-on-primary-container', 'font-bold');
        tab.classList.remove('text-secondary', 'hover:bg-surface-container');

        this.currentCity = tab.getAttribute('data-city');
        this.render();
      });
    });
  },

  getDeals() {
    return (this.allProperties || []).filter(item => {
      if (!item.isDeal && (!item.discountPercent || item.discountPercent <= 0)) return false;
      if (this.currentCity !== 'الكل' && !item.city.includes(this.currentCity)) return false;
      return true;
    }).sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
  },

  render() {
    const container = document.getElementById('deals-grid');
    if (!container) return;

    const deals = this.getDeals();

    if (deals.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center bg-pure-white rounded-2xl border border-border-gray p-8">
          <p class="text-on-surface font-bold text-lg mb-2">لا توجد صفقات لقطة حالياً في هذه المنطقة</p>
          <p class="text-secondary text-sm mb-4">اشترك في خدمة تنبيهات الصفقات اللحظية لتصلك فور إضافتها!</p>
          <button onclick="document.getElementById('deals-alert-modal').classList.remove('hidden')" class="btn-primary px-6 py-2.5 rounded font-label-md text-sm">تفعيل تنبيهات الصفقات</button>
        </div>
      `;
      return;
    }

    container.innerHTML = deals.map(item => {
      const discountLabel = item.discountPercent ? `وفر ${item.discountPercent}%` : 'فرصة نادرة';
      const savings = (item.originalPrice || item.price * 1.1) - item.price;

      return `
        <article class="bg-pure-white rounded-2xl border border-border-gray overflow-hidden hover-gold-glow flex flex-col group relative">
          <div class="relative h-64 img-zoom-container bg-surface-container-high">
            <img class="w-full h-full object-cover" src="${item.images[0]}" alt="${item.title}" loading="lazy">
            <div class="absolute top-4 right-4 bg-badge-gold-bg text-badge-gold-text px-3 py-1 rounded-full font-label-sm text-xs font-bold flex items-center gap-1 shadow-sm">
              <span class="material-symbols-outlined text-[14px]">local_fire_department</span>
              <span>${discountLabel}</span>
            </div>
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
            
            <div class="bg-surface-container-low p-4 rounded-xl mb-5 border border-border-gray/60">
              <div class="flex justify-between items-center mb-1">
                <span class="text-xs text-secondary line-through">${formatEGP(item.originalPrice || item.price + 300000)}</span>
                <span class="text-xs font-bold text-success-green bg-success-green/10 px-2 py-0.5 rounded">وفر ${formatEGP(savings)}</span>
              </div>
              <div class="text-2xl font-black text-primary mb-2 font-headline-md">${formatEGP(item.price)}</div>
              <div class="text-xs text-on-surface-variant flex gap-4 pt-2 border-t border-border-gray/60 font-body-md">
                <span><strong>المقدم:</strong> ${formatEGP(item.downPayment)}</span>
                <span><strong>السداد:</strong> ${item.installmentPlan}</span>
              </div>
            </div>

            <div class="flex items-center justify-between text-secondary mb-4 text-xs border-b border-border-gray pb-4 font-body-md">
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-primary text-sm">bed</span> ${item.bedrooms} غرف</span>
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-primary text-sm">bathtub</span> ${item.bathrooms} حمام</span>
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-primary text-sm">square_foot</span> ${item.area} م²</span>
            </div>

            <div class="flex gap-3 mt-auto">
              <button onclick="openWhatsAppLead('${item.title} - صفقة لقطة', '${item.id}')" class="flex-1 bg-primary-container text-on-primary-container py-3 rounded-lg text-xs font-bold font-label-md btn-gold-glow flex items-center justify-center gap-1.5">
                <span class="material-symbols-outlined text-base">headset_mic</span>
                <span>تواصل مع مستشار</span>
              </button>
              <a href="property-details.html?id=${item.id}" class="btn-secondary px-4 py-3 rounded-lg text-xs text-center font-bold font-label-md">التفاصيل</a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    if (window.Favorites) {
      window.Favorites.initHeartButtons();
    }
  }
};

// Immediate initialization
if (typeof onReady === 'function') {
  onReady(() => ResaleApp.init());
} else if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ResaleApp.init());
} else {
  ResaleApp.init();
}
