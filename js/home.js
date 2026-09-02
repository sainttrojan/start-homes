/**
 * Start Homes - Dynamic Homepage Listings Renderer (Supabase Connected)
 */

const HomeApp = {
  async init() {
    let properties = [];
    try {
      if (window.DataService) {
        properties = await DataService.getProperties();
      } else {
        properties = typeof PROPERTIES_DATA !== 'undefined' ? PROPERTIES_DATA : [];
      }

      this.renderHotDeals(properties || []);
      this.renderLatestUnits(properties || []);

      if (window.Favorites) {
        window.Favorites.initHeartButtons();
      }
    } catch (err) {
      console.error('Error initializing HomeApp:', err);
    }
  },

  renderHotDeals(properties) {
    const container = document.getElementById('home-deals-grid');
    if (!container) return;

    const deals = properties
      .filter(p => p.isDeal || (p.discountPercent && p.discountPercent > 0))
      .slice(0, 3);

    const itemsToRender = deals.length > 0 ? deals : properties.slice(0, 3);

    if (itemsToRender.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center bg-pure-white rounded-2xl border border-border-gray p-8">
          <span class="material-symbols-outlined text-4xl text-secondary mb-2">apartment</span>
          <p class="text-on-surface font-bold text-base mb-1">لا توجد صفقات لقطة مضافة حالياً</p>
          <p class="text-xs text-secondary mb-4">يمكنك إضافة أول وحدة من لوحة التحكم لتظهر هنا فوراً.</p>
          <a href="admin.html" class="btn-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold">
            <span class="material-symbols-outlined text-base">add_circle</span>
            <span>إضافة عقار من لوحة التحكم</span>
          </a>
        </div>
      `;
      return;
    }

    container.innerHTML = itemsToRender.map(item => {
      const discountLabel = item.discountPercent ? `وفر ${item.discountPercent}%` : 'صفقة نادرة';
      const savings = (item.originalPrice || item.price * 1.1) - item.price;

      return `
        <article class="bg-pure-white border border-border-gray rounded-2xl overflow-hidden hover-gold-glow flex flex-col group">
          <div class="relative h-64 img-zoom-container bg-surface-container-high">
            <img class="w-full h-full object-cover" src="${item.images[0]}" alt="${item.title}" loading="lazy">
            <div class="absolute top-4 right-4 bg-badge-gold-bg text-badge-gold-text font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <span class="material-symbols-outlined text-[14px]">local_fire_department</span>
              <span>${discountLabel}</span>
            </div>
            <button class="fav-btn absolute top-4 left-4 w-9 h-9 rounded-full bg-pure-white/80 hover:bg-pure-white backdrop-blur-md flex items-center justify-center text-on-surface transition-all shadow-sm" data-id="${item.id}" title="حفظ في المفضلة">
              <span class="material-symbols-outlined text-[18px]">favorite</span>
            </button>
            <div class="absolute bottom-4 right-4 bg-on-surface/85 text-pure-white px-3 py-1 rounded backdrop-blur-sm text-xs font-semibold">
              ${item.district || item.city}
            </div>
          </div>
          <div class="p-6 flex flex-col flex-1">
            <h3 class="text-lg font-bold text-on-surface mb-1 group-hover:text-primary transition-colors line-clamp-1">
              <a href="property-details.html?id=${item.id}">${item.title}</a>
            </h3>
            <p class="text-xs text-secondary mb-4 line-clamp-1">${item.subtitle || item.description}</p>
            
            <div class="bg-surface-container-low p-4 rounded-xl mb-5 border border-border-gray/60">
              <div class="flex justify-between items-center mb-1">
                <span class="text-xs text-secondary line-through">${formatEGP(item.originalPrice || item.price + 300000)}</span>
                <span class="text-xs font-bold text-success-green bg-success-green/10 px-2 py-0.5 rounded">وفر ${formatEGP(savings)}</span>
              </div>
              <div class="text-2xl font-black text-primary mb-2">${formatEGP(item.price)}</div>
              <div class="text-xs text-on-surface-variant flex gap-4 pt-2 border-t border-border-gray/60">
                <span><strong>المقدم:</strong> ${formatEGP(item.downPayment)}</span>
                <span><strong>السداد:</strong> ${item.installmentPlan}</span>
              </div>
            </div>

            <div class="flex gap-3 mt-auto">
              <button onclick="openWhatsAppLead('${item.title} - صفقة لقطة', '${item.id}')" class="flex-1 bg-primary-container text-on-primary-container py-3 rounded-lg text-xs font-bold btn-gold-glow flex items-center justify-center gap-1.5">
                <span class="material-symbols-outlined text-base">headset_mic</span>
                <span>تواصل مع مستشار</span>
              </button>
              <a href="property-details.html?id=${item.id}" class="btn-secondary px-4 py-3 rounded-lg text-xs text-center font-bold">التفاصيل</a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  },

  renderLatestUnits(properties) {
    const container = document.getElementById('home-latest-grid');
    if (!container) return;

    const latest = properties.slice(0, 6);

    if (latest.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center bg-pure-white rounded-2xl border border-border-gray p-8">
          <span class="material-symbols-outlined text-4xl text-secondary mb-2">home_work</span>
          <p class="text-on-surface font-bold text-base mb-1">لا توجد وحدات معروضة حالياً</p>
          <p class="text-xs text-secondary mb-4">أضف شقتك أو فيلتك الأولى من لوحة التحكم لتظهر هنا مباشرة.</p>
          <a href="admin.html" class="btn-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold">
            <span class="material-symbols-outlined text-base">add_circle</span>
            <span>إضافة عقار جديد الآن</span>
          </a>
        </div>
      `;
      return;
    }

    container.innerHTML = latest.map(item => {
      let badgeHtml = '';
      if (item.isDeal) {
        badgeHtml = `<div class="absolute top-4 right-4 bg-badge-gold-bg text-badge-gold-text px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm"><span class="material-symbols-outlined text-[14px]">local_fire_department</span> لقطة</div>`;
      } else if (item.isExclusive) {
        badgeHtml = `<div class="absolute top-4 right-4 bg-badge-gold-bg text-badge-gold-text px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm"><span class="material-symbols-outlined text-[14px]">star</span> حصرية</div>`;
      } else {
        badgeHtml = `<div class="absolute top-4 right-4 bg-badge-gold-bg text-badge-gold-text px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm"><span class="material-symbols-outlined text-[14px]">fiber_new</span> جديد</div>`;
      }

      return `
        <article class="property-card rounded-2xl overflow-hidden flex flex-col group">
          <div class="relative h-64 img-zoom-container bg-surface-container-high">
            <img class="w-full h-full object-cover" src="${item.images[0]}" alt="${item.title}" loading="lazy">
            ${badgeHtml}
            <button class="fav-btn absolute top-4 left-4 w-9 h-9 rounded-full bg-pure-white/80 hover:bg-pure-white backdrop-blur-md flex items-center justify-center text-on-surface transition-all shadow-sm" data-id="${item.id}" title="حفظ في المفضلة">
              <span class="material-symbols-outlined text-[18px]">favorite</span>
            </button>
            <div class="absolute bottom-4 right-4 bg-on-surface/85 text-pure-white px-3 py-1 rounded backdrop-blur-sm text-xs font-semibold">
              ${item.district || item.city}
            </div>
            <div class="absolute bottom-4 left-4 bg-primary-container text-on-primary-container px-2.5 py-0.5 rounded text-xs font-bold">
              ${item.type}
            </div>
          </div>
          <div class="p-6 flex flex-col flex-1">
            <h3 class="text-lg font-bold text-on-surface mb-1 group-hover:text-primary transition-colors line-clamp-1">
              <a href="property-details.html?id=${item.id}">${item.title}</a>
            </h3>
            <p class="text-xs text-secondary mb-4 line-clamp-1">${item.subtitle || item.description}</p>
            
            <div class="flex items-center justify-between text-secondary mb-4 text-xs border-y border-border-gray py-3 bg-surface-bright -mx-6 px-6">
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-primary text-sm">bed</span> ${item.bedrooms} غرف</span>
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-primary text-sm">bathtub</span> ${item.bathrooms} حمام</span>
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-primary text-sm">square_foot</span> ${item.area} م²</span>
            </div>

            <div class="mb-5 flex-1">
              <div class="text-xl font-bold text-on-surface">${formatEGP(item.price)}</div>
              <div class="text-xs text-secondary mt-1 flex justify-between">
                <span>المقدم: <strong class="text-on-surface">${formatEGP(item.downPayment)}</strong></span>
                <span class="text-primary font-bold">${item.installmentPlan}</span>
              </div>
            </div>

            <div class="flex gap-3 mt-auto">
              <a href="property-details.html?id=${item.id}" class="btn-secondary flex-1 py-2.5 rounded-lg text-center text-xs font-bold flex items-center justify-center gap-1">
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
  }
};

// Immediate initialization
if (typeof onReady === 'function') {
  onReady(() => HomeApp.init());
} else if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => HomeApp.init());
} else {
  HomeApp.init();
}
