/**
 * Start Homes - Admin Dashboard Logic (Secure with Supabase Auth & RLS)
 */

const AdminApp = {
  currentTab: 'properties',
  properties: [],
  inquiries: [],
  sellerRequests: [],
  editingPropertyId: null,

  async init() {
    this.bindAuth();
    this.bindNavigation();
    this.bindSupabaseSettings();
    this.bindPropertyForm();

    if (this.checkAuth()) {
      await this.refreshData();
    }
    this.checkConnectionStatus();
  },

  bindAuth() {
    const loginForm = document.getElementById('admin-login-form');
    const logoutBtn = document.getElementById('admin-logout-btn');

    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email')?.value.trim();
        const password = document.getElementById('login-password')?.value.trim();
        const submitBtn = document.getElementById('login-submit-btn');

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<span>جاري تسجيل الدخول...</span>`;
        }

        try {
          await AuthService.login(email, password);
          showToast('تم تسجيل الدخول بنجاح! مرحباً بك في لوحة الإدارة 🛡️', 'success');
          this.checkAuth();
          await this.refreshData();
        } catch (err) {
          showToast(err.message || 'فشل تسجيل الدخول. تأكد من البريد وكلمة المرور.', 'error');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
              <span class="material-symbols-outlined text-base">lock_open</span>
              <span>دخول لوحة التحكم</span>
            `;
          }
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await AuthService.logout();
        showToast('تم تسجيل الخروج بنجاح.', 'info');
        this.checkAuth();
      });
    }
  },

  checkAuth() {
    const isAuth = AuthService.isAuthenticated();
    const loginModal = document.getElementById('admin-login-modal');
    const userProfile = document.getElementById('admin-user-profile');
    const userEmailEl = document.getElementById('admin-user-email');

    if (isAuth) {
      if (loginModal) loginModal.classList.add('hidden');
      if (userProfile) userProfile.classList.remove('hidden');
      const user = AuthService.getUser();
      if (userEmailEl && user) {
        userEmailEl.textContent = user.email || 'Admin';
      }
      return true;
    } else {
      if (loginModal) loginModal.classList.remove('hidden');
      if (userProfile) userProfile.classList.add('hidden');
      return false;
    }
  },

  bindNavigation() {
    const navButtons = document.querySelectorAll('.admin-nav-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });
  },

  switchTab(tab) {
    this.currentTab = tab;
    
    // Update nav active states
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
      if (btn.getAttribute('data-tab') === tab) {
        btn.classList.add('bg-primary-container', 'text-on-primary-container', 'font-bold');
        btn.classList.remove('text-secondary', 'hover:bg-surface-container');
      } else {
        btn.classList.remove('bg-primary-container', 'text-on-primary-container', 'font-bold');
        btn.classList.add('text-secondary', 'hover:bg-surface-container');
      }
    });

    // Toggle tab panels
    document.querySelectorAll('.admin-panel').forEach(panel => {
      if (panel.id === `panel-${tab}`) {
        panel.classList.remove('hidden');
      } else {
        panel.classList.add('hidden');
      }
    });

    if (tab === 'properties') this.renderPropertiesTable();
    if (tab === 'inquiries') this.renderInquiriesTable();
    if (tab === 'sellers') this.renderSellerRequestsTable();
  },

  async refreshData() {
    try {
      this.properties = await DataService.getProperties();
      this.inquiries = await DataService.getInquiries();
      this.sellerRequests = await DataService.getSellerRequests();
    } catch (err) {
      console.error('Error refreshing admin data:', err);
    }
    
    this.updateStats();
    this.renderPropertiesTable();
    this.renderInquiriesTable();
    this.renderSellerRequestsTable();
  },

  updateStats() {
    const totalEl = document.getElementById('stat-total-props');
    const dealsEl = document.getElementById('stat-deals');
    const inqEl = document.getElementById('stat-inquiries');
    const sellersEl = document.getElementById('stat-sellers');

    if (totalEl) totalEl.textContent = this.properties.length;
    if (dealsEl) dealsEl.textContent = this.properties.filter(p => p.isDeal).length;
    if (inqEl) inqEl.textContent = this.inquiries.length;
    if (sellersEl) sellersEl.textContent = this.sellerRequests.length;
  },

  renderPropertiesTable() {
    const tbody = document.getElementById('props-table-body');
    if (!tbody) return;

    if (this.properties.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="py-12 text-center text-secondary">
            لا توجد عقارات مسجلة بعد. اضغط على زر "إضافة عقار جديد" لإضافة أول وحدة.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.properties.map(p => `
      <tr class="border-b border-border-gray hover:bg-surface-container-low/50 transition-colors">
        <td class="p-4">
          <div class="flex items-center gap-3">
            <img src="${p.images[0]}" alt="${p.title}" class="w-12 h-12 rounded-lg object-cover border border-border-gray shrink-0">
            <div>
              <div class="font-bold text-on-surface text-sm line-clamp-1">${p.title}</div>
              <div class="text-xs text-secondary">${p.city} - ${p.district}</div>
            </div>
          </div>
        </td>
        <td class="p-4 text-xs font-semibold text-on-surface">${p.type}</td>
        <td class="p-4 text-xs font-bold text-primary">${formatEGP(p.price)}</td>
        <td class="p-4 text-xs text-secondary">${p.bedrooms} غرف | ${p.area}م²</td>
        <td class="p-4">
          <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${p.isDeal ? 'bg-badge-gold-bg text-badge-gold-text' : 'bg-success-green/15 text-success-green'}">
            ${p.isDeal ? 'صفقة لقطة 🔥' : 'متاح للبيع'}
          </span>
        </td>
        <td class="p-4 text-xs text-secondary">
          <div class="flex items-center gap-2">
            <a href="property-details.html?id=${p.id}" target="_blank" class="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-surface-container" title="معاينة في الموقع">
              <span class="material-symbols-outlined text-lg">visibility</span>
            </a>
            <button onclick="AdminApp.editProperty('${p.id}')" class="p-1.5 rounded-lg text-primary hover:bg-primary-container/20" title="تعديل">
              <span class="material-symbols-outlined text-lg">edit</span>
            </button>
            <button onclick="AdminApp.deleteProperty('${p.id}')" class="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10" title="حذف">
              <span class="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  renderInquiriesTable() {
    const tbody = document.getElementById('inquiries-table-body');
    if (!tbody) return;

    if (this.inquiries.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="py-12 text-center text-secondary">
            لا توجد طلبات معاينة جديدة حتى الآن.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.inquiries.map(inq => `
      <tr class="border-b border-border-gray hover:bg-surface-container-low/50 transition-colors">
        <td class="p-4">
          <div class="font-bold text-on-surface text-sm">${inq.clientName}</div>
          <div class="text-xs text-secondary">${new Date(inq.createdAt || Date.now()).toLocaleDateString('ar-EG')}</div>
        </td>
        <td class="p-4 text-xs font-semibold text-on-surface" dir="ltr">${inq.clientPhone}</td>
        <td class="p-4 text-xs text-secondary">${inq.propertyTitle}</td>
        <td class="p-4 text-xs text-secondary">${inq.preferredDate || 'غير محدد'}</td>
        <td class="p-4">
          <a href="https://wa.me/${inq.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`مرحباً أ/ ${inq.clientName}، بخصوص طلب معاينة ${inq.propertyTitle}`)}" target="_blank" class="btn-primary inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold">
            <span class="material-symbols-outlined text-sm">chat</span>
            <span>واتساب العميل</span>
          </a>
        </td>
      </tr>
    `).join('');
  },

  renderSellerRequestsTable() {
    const tbody = document.getElementById('sellers-table-body');
    if (!tbody) return;

    if (this.sellerRequests.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="py-12 text-center text-secondary">
            لا توجد عروض بيع مرسلة من الملاك حتى الآن.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.sellerRequests.map(req => `
      <tr class="border-b border-border-gray hover:bg-surface-container-low/50 transition-colors">
        <td class="p-4">
          <div class="font-bold text-on-surface text-sm">${req.ownerName}</div>
          <div class="text-xs text-secondary" dir="ltr">${req.ownerPhone}</div>
        </td>
        <td class="p-4 text-xs text-on-surface">
          <div class="font-bold">${req.unitType} - ${req.city}</div>
          <div class="text-secondary">${req.compound || ''} | الدور ${req.floor || '-'}</div>
        </td>
        <td class="p-4 text-xs text-secondary">${req.bedrooms} غرف | ${req.area}م²</td>
        <td class="p-4 text-xs font-bold text-primary">${formatEGP(req.priceTotal)}</td>
        <td class="p-4 text-xs text-secondary">${req.finishing}</td>
        <td class="p-4">
          <button onclick="AdminApp.publishSellerRequest(${req.id})" class="btn-primary inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm" title="اعتماد ونشر كوحدة في الموقع">
            <span class="material-symbols-outlined text-sm">publish</span>
            <span>نشر في الموقع</span>
          </button>
        </td>
      </tr>
    `).join('');
  },

  bindPropertyForm() {
    const form = document.getElementById('property-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const imagesInput = document.getElementById('form-prop-images')?.value.trim();
      const imagesList = imagesInput ? imagesInput.split('\n').map(s => s.trim()).filter(Boolean) : [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDREq9v_PqViSCUwgZ7YBgeZR7WsnKChX9iXdisD0gEgPTnpkagUc0fh4ByL6yb_-KHbhlEEfivbDwUM9igkKubwmBRuOsAxWaLDNPZlu_gw_ubPV5BiutCnR4x-dpMqEfH7ozGZA2zrPj-IDb5fKzfuEFDTtRX9bG4DSR8JeKThzdHMkZPKGv1yT6wes38fIqs9pYEig0GOY6_DznutNL89wG_zLN0o0i1jZtBvqAj6Vh1qtJ9tdWB"
      ];

      const propData = {
        title: document.getElementById('form-prop-title').value.trim(),
        subtitle: document.getElementById('form-prop-subtitle').value.trim(),
        city: document.getElementById('form-prop-city').value,
        district: document.getElementById('form-prop-district').value.trim(),
        type: document.getElementById('form-prop-type').value,
        price: Number(document.getElementById('form-prop-price').value),
        originalPrice: Number(document.getElementById('form-prop-original-price').value) || Number(document.getElementById('form-prop-price').value),
        downPayment: Number(document.getElementById('form-prop-downpayment').value) || 0,
        installmentPlan: document.getElementById('form-prop-plan').value.trim() || 'كاش',
        bedrooms: Number(document.getElementById('form-prop-beds').value) || 3,
        bathrooms: Number(document.getElementById('form-prop-baths').value) || 2,
        area: Number(document.getElementById('form-prop-area').value) || 140,
        floor: document.getElementById('form-prop-floor').value.trim() || 'الدور الثاني',
        finishing: document.getElementById('form-prop-finishing').value,
        viewType: document.getElementById('form-prop-view').value.trim() || 'فيو مفتوح',
        isDeal: document.getElementById('form-prop-is-deal').checked,
        discountPercent: Number(document.getElementById('form-prop-discount').value) || 0,
        isExclusive: document.getElementById('form-prop-is-exclusive').checked,
        isNew: document.getElementById('form-prop-is-new').checked,
        isReady: true,
        legalCheck: true,
        images: imagesList,
        description: document.getElementById('form-prop-desc').value.trim()
      };

      if (this.editingPropertyId) {
        await DataService.updateProperty(this.editingPropertyId, propData);
        showToast('تم تحديث بيانات العقار بنجاح!', 'success');
        this.editingPropertyId = null;
      } else {
        await DataService.addProperty(propData);
        showToast('تم إضافة العقار الجديد بنجاح إلى قاعدة البيانات!', 'success');
      }

      form.reset();
      await this.refreshData();
      this.switchTab('properties');
    });
  },

  editProperty(id) {
    const prop = this.properties.find(p => String(p.id) === String(id));
    if (!prop) return;

    this.editingPropertyId = id;
    this.switchTab('add-property');

    document.getElementById('form-prop-title').value = prop.title || '';
    document.getElementById('form-prop-subtitle').value = prop.subtitle || '';
    document.getElementById('form-prop-city').value = prop.city || 'مدينتي';
    document.getElementById('form-prop-district').value = prop.district || '';
    document.getElementById('form-prop-type').value = prop.type || 'شقة';
    document.getElementById('form-prop-price').value = prop.price || '';
    document.getElementById('form-prop-original-price').value = prop.originalPrice || '';
    document.getElementById('form-prop-downpayment').value = prop.downPayment || '';
    document.getElementById('form-prop-plan').value = prop.installmentPlan || '';
    document.getElementById('form-prop-beds').value = prop.bedrooms || 3;
    document.getElementById('form-prop-baths').value = prop.bathrooms || 2;
    document.getElementById('form-prop-area').value = prop.area || 140;
    document.getElementById('form-prop-floor').value = prop.floor || '';
    document.getElementById('form-prop-finishing').value = prop.finishing || 'سوبر لوكس';
    document.getElementById('form-prop-view').value = prop.viewType || '';
    document.getElementById('form-prop-is-deal').checked = Boolean(prop.isDeal);
    document.getElementById('form-prop-discount').value = prop.discountPercent || 0;
    document.getElementById('form-prop-is-exclusive').checked = Boolean(prop.isExclusive);
    document.getElementById('form-prop-is-new').checked = Boolean(prop.isNew);
    document.getElementById('form-prop-images').value = (prop.images || []).join('\n');
    document.getElementById('form-prop-desc').value = prop.description || '';

    document.getElementById('form-submit-btn').textContent = 'حفظ التعديلات';
  },

  async deleteProperty(id) {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا العقار نهائياً؟')) {
      await DataService.deleteProperty(id);
      showToast('تم حذف العقار بنجاح.', 'info');
      await this.refreshData();
    }
  },

  async publishSellerRequest(id) {
    const req = this.sellerRequests.find(r => r.id === id);
    if (!req) return;

    const newProp = {
      title: `${req.unitType} ${req.area}م² للبيع في ${req.city} - ${req.compound || ''}`,
      subtitle: `تشطيب ${req.finishing} - ${req.floor}`,
      city: req.city,
      district: req.compound || req.city,
      type: req.unitType,
      price: req.priceTotal,
      originalPrice: req.priceTotal,
      downPayment: req.priceCash || req.priceTotal,
      installmentPlan: req.priceCash && req.priceCash < req.priceTotal ? 'متبقي أقساط' : 'كاش',
      bedrooms: req.bedrooms || 3,
      bathrooms: req.bathrooms || 2,
      area: req.area || 140,
      floor: req.floor || 'الدور الثاني',
      finishing: req.finishing || 'سوبر لوكس',
      viewType: 'فيو مفتوح',
      isDeal: false,
      discountPercent: 0,
      isExclusive: false,
      isNew: true,
      isReady: true,
      legalCheck: true,
      images: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDREq9v_PqViSCUwgZ7YBgeZR7WsnKChX9iXdisD0gEgPTnpkagUc0fh4ByL6yb_-KHbhlEEfivbDwUM9igkKubwmBRuOsAxWaLDNPZlu_gw_ubPV5BiutCnR4x-dpMqEfH7ozGZA2zrPj-IDb5fKzfuEFDTtRX9bG4DSR8JeKThzdHMkZPKGv1yT6wes38fIqs9pYEig0GOY6_DznutNL89wG_zLN0o0i1jZtBvqAj6Vh1qtJ9tdWB"
      ],
      description: req.notes || 'وحدة مميزة معروضة للبيع عبر منصة ستارت هومز مباشرة من المالك.'
    };

    await DataService.addProperty(newProp);
    showToast('تم اعتماد الوحدة ونشرها بنجاح في الموقع!', 'success');
    await this.refreshData();
    this.switchTab('properties');
  },

  bindSupabaseSettings() {
    const configInput = document.getElementById('firebase-config-input');
    const saveBtn = document.getElementById('firebase-save-btn');

    if (configInput) {
      const cfg = FirebaseConfig.getConfig();
      if(cfg) configInput.value = JSON.stringify(cfg, null, 2);
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        try {
          FirebaseConfig.saveConfig(configInput.value);
          FirebaseConfig.initApp();
          this.checkConnectionStatus();
          await this.refreshData();
          showToast('تم حفظ إعدادات Firebase بنجاح!', 'success');
        } catch(e) {
          showToast(e.message, 'error');
        }
      });
    }
    if (copySqlBtn) {
      copySqlBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
        showToast('تم نسخ كود SQL الأمني لحماية الجداول بنجاح!', 'success');
      });
    }
  },

  checkConnectionStatus() {
    const badge = document.getElementById('supabase-status-badge');
    if (!badge) return;

    if (FirebaseConfig.isConnected()) {
      badge.innerHTML = `
        <span class="w-2.5 h-2.5 rounded-full bg-success-green inline-block animate-pulse"></span>
        <span class="text-success-green font-bold">متصل بـ Supabase Cloud</span>
      `;
    } else {
      badge.innerHTML = `
        <span class="w-2.5 h-2.5 rounded-full bg-badge-gold-text inline-block"></span>
        <span class="text-secondary font-bold">الوضع المحلي (Local Storage) - جاهز للربط</span>
      `;
    }
  }
};

if (typeof onReady === 'function') {
  onReady(() => AdminApp.init());
} else if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AdminApp.init());
} else {
  AdminApp.init();
}
