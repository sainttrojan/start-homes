/**
 * Start Homes - Favorites Management
 */

const Favorites = {
  KEY: 'start_homes_favorites',

  getAll() {
    try {
      const saved = localStorage.getItem(this.KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading favorites:', e);
      return [];
    }
  },

  isFavorited(propertyId) {
    const list = this.getAll();
    return list.includes(Number(propertyId));
  },

  toggle(propertyId) {
    let list = this.getAll();
    const id = Number(propertyId);
    const index = list.indexOf(id);
    let added = false;

    if (index === -1) {
      list.push(id);
      added = true;
    } else {
      list.splice(index, 1);
      added = false;
    }

    try {
      localStorage.setItem(this.KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error saving favorites:', e);
    }

    this.updateCounters();
    this.updateHeartIcons(id, added);

    if (typeof showToast === 'function') {
      showToast(added ? 'تمت إضافة الوحدة إلى المفضلة' : 'تمت إزالة الوحدة من المفضلة', added ? 'success' : 'info');
    }

    return added;
  },

  updateCounters() {
    const count = this.getAll().length;
    const badges = document.querySelectorAll('.favorites-badge-count');
    badges.forEach(badge => {
      badge.textContent = count;
      if (count > 0) {
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    });
  },

  updateHeartIcons(propertyId, isFav) {
    const btns = document.querySelectorAll(`.fav-btn[data-id="${propertyId}"]`);
    btns.forEach(btn => {
      const icon = btn.querySelector('.material-symbols-outlined') || btn;
      if (isFav) {
        icon.classList.add('text-red-500', 'fill-current');
        icon.style.fontVariationSettings = "'FILL' 1";
      } else {
        icon.classList.remove('text-red-500');
        icon.style.fontVariationSettings = "'FILL' 0";
      }
    });
  },

  initHeartButtons() {
    const list = this.getAll();
    const btns = document.querySelectorAll('.fav-btn');
    btns.forEach(btn => {
      const id = Number(btn.getAttribute('data-id'));
      const isFav = list.includes(id);
      const icon = btn.querySelector('.material-symbols-outlined') || btn;
      if (isFav) {
        icon.classList.add('text-red-500');
        icon.style.fontVariationSettings = "'FILL' 1";
      } else {
        icon.classList.remove('text-red-500');
        icon.style.fontVariationSettings = "'FILL' 0";
      }

      // Add click handler if not added
      if (!btn.hasAttribute('data-fav-bound')) {
        btn.setAttribute('data-fav-bound', 'true');
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.toggle(id);
        });
      }
    });
    this.updateCounters();
  },

  renderFavoritesModal() {
    const favIds = this.getAll();
    const container = document.getElementById('favorites-modal-list');
    if (!container) return;

    if (favIds.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <span class="material-symbols-outlined text-5xl text-secondary mb-3">favorite_border</span>
          <p class="text-on-surface font-headline-md text-lg mb-2">لا توجد عقارات في المفضلة بعد</p>
          <p class="text-secondary text-body-sm mb-6">تصفح الوحدات المتاحة واضغط على علامة القلب لحفظها هنا.</p>
          <a href="latest-units.html" class="btn-primary inline-block px-6 py-2.5 rounded text-sm">تصفح أحدث الوحدات</a>
        </div>
      `;
      return;
    }

    let allProps = PROPERTIES_DATA;
    if (window.DataService) {
      allProps = await DataService.getProperties();
    }
    const items = allProps.filter(p => favIds.includes(p.id) || favIds.includes(String(p.id)) || favIds.includes(Number(p.id)));
    container.innerHTML = items.map(p => `
      <div class="flex items-center gap-4 p-3 bg-surface-bright rounded-lg border border-border-gray hover:border-primary-container transition-all">
        <img src="${p.images[0]}" alt="${p.title}" class="w-20 h-20 rounded object-cover flex-shrink-0">
        <div class="flex-1 min-w-0">
          <a href="property-details.html?id=${p.id}" class="font-bold text-on-surface hover:text-primary transition-colors text-sm line-clamp-1">${p.title}</a>
          <p class="text-secondary text-xs mt-0.5">${p.city} - ${p.district}</p>
          <div class="text-primary font-bold text-sm mt-1">${formatEGP(p.price)}</div>
        </div>
        <div class="flex flex-col gap-2 items-end">
          <button onclick="Favorites.toggle('${p.id}'); Favorites.renderFavoritesModal();" class="text-red-500 hover:text-red-700 p-1" title="حذف من المفضلة">
            <span class="material-symbols-outlined text-lg">delete</span>
          </button>
          <a href="property-details.html?id=${p.id}" class="btn-primary text-xs px-3 py-1.5 rounded">التفاصيل</a>
        </div>
      </div>
    `).join('');
  }
};

if (typeof onReady === 'function') {
  onReady(() => Favorites.initHeartButtons());
} else if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Favorites.initHeartButtons());
} else {
  Favorites.initHeartButtons();
}
