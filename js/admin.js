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

    AuthService.onAuthStateChanged(async (user) => {
      this.checkAuth();
      if (user) {
        await this.refreshData();
      }
    });

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
            <img src="${p.images[0]}" alt="${p.address || p.title || p.purpose}" class="w-12 h-12 rounded-lg object-cover border border-border-gray shrink-0">
            <div>
              <div class="font-bold text-on-surface text-sm line-clamp-1">${p.address || p.title || p.purpose}</div>
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

      const submitBtn = document.getElementById('form-submit-btn');
      const spinner = document.getElementById('submit-spinner');
      if (submitBtn) submitBtn.disabled = true;
      if (spinner) spinner.classList.remove('hidden');

      try {
        let uploadedImages = [];
        const fileInput = document.getElementById('form-images');
        if (fileInput && fileInput.files.length > 0) {
          uploadedImages = await DataService.uploadImages(fileInput.files);
        }

        const propData = {
          purpose: document.getElementById('form-purpose') ? document.getElementById('form-purpose').value : '',
          address: document.getElementById('form-address') ? document.getElementById('form-address').value.trim() : '',
          ownerName: document.getElementById('form-owner-name') ? document.getElementById('form-owner-name').value.trim() : '',
          ownerPhone1: document.getElementById('form-owner-phone1') ? document.getElementById('form-owner-phone1').value.trim() : '',
          ownerPhone2: document.getElementById('form-owner-phone2') ? document.getElementById('form-owner-phone2').value.trim() : '',

          phase: document.getElementById('form-phase') ? document.getElementById('form-phase').value.trim() : '',
          model: document.getElementById('form-model') ? document.getElementById('form-model').value.trim() : '',
          area: document.getElementById('form-area') ? Number(document.getElementById('form-area').value) : 0,
          floor: document.getElementById('form-floor') ? document.getElementById('form-floor').value : '',
          viewType: document.getElementById('form-view') ? document.getElementById('form-view').value : '',
          finishing: document.getElementById('form-finishing') ? document.getElementById('form-finishing').value : '',
          bedrooms: document.getElementById('form-bedrooms') ? Number(document.getElementById('form-bedrooms').value) : 0,
          bathrooms: document.getElementById('form-bathrooms') ? Number(document.getElementById('form-bathrooms').value) : 0,
          gardenArea: document.getElementById('form-garden-area') ? Number(document.getElementById('form-garden-area').value) : 0,

          totalPrice: document.getElementById('form-total-price') ? Number(document.getElementById('form-total-price').value) : 0,
          paidAmount: document.getElementById('form-paid') ? Number(document.getElementById('form-paid').value) : 0,
          overPrice: document.getElementById('form-over') ? Number(document.getElementById('form-over').value) : 0,
          remainingAmount: document.getElementById('form-remaining') ? Number(document.getElementById('form-remaining').value) : 0,
          deposit: document.getElementById('form-deposit') ? Number(document.getElementById('form-deposit').value) : 0,
          annualInstallment: document.getElementById('form-annual-inst') ? Number(document.getElementById('form-annual-inst').value) : 0,
          monthlyInstallment: document.getElementById('form-monthly-inst') ? Number(document.getElementById('form-monthly-inst').value) : 0,

          landmark: document.getElementById('form-landmark') ? document.getElementById('form-landmark').value.trim() : '',
          locationLink: document.getElementById('form-location-link') ? document.getElementById('form-location-link').value.trim() : '',
          propertyStatus: document.getElementById('form-status') ? document.getElementById('form-status').value : '',
          deliveryDate: document.getElementById('form-delivery-date') ? document.getElementById('form-delivery-date').value : '',
          description: document.getElementById('form-desc') ? document.getElementById('form-desc').value.trim() : '',
        };

        if (uploadedImages.length > 0) {
          propData.images = uploadedImages;
        }

        if (this.editingPropertyId) {
          if (uploadedImages.length === 0) {
             const existing = await DataService.getPropertyById(this.editingPropertyId);
             if (existing && existing.images) propData.images = existing.images;
          }
          await DataService.updateProperty(this.editingPropertyId, propData);
          showToast('تم تحديث بيانات العقار بنجاح!', 'success');
          this.editingPropertyId = null;
        } else {
          await DataService.addProperty(propData);
          showToast('تمت إضافة العقار بنجاح!', 'success');
        }

        form.reset();
        const lbl = document.getElementById('file-count-label');
        if (lbl) lbl.textContent = 'اضغط هنا لاختيار صور من جهازك';
        await this.refreshData();
        this.switchTab('properties');
      } catch (err) {
        showToast(err.message || 'حدث خطأ أثناء الحفظ', 'error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (spinner) spinner.classList.add('hidden');
      }
    });
  },

  editProperty(id) {
    const prop = this.properties.find(p => String(p.id) === String(id));
    if (!prop) return;

    this.editingPropertyId = id;
    this.switchTab('add-property');

    if (document.getElementById('form-purpose')) document.getElementById('form-purpose').value = prop.purpose || 'بيع - كاش';
    if (document.getElementById('form-address')) document.getElementById('form-address').value = prop.address || prop.title || '';
    if (document.getElementById('form-owner-name')) document.getElementById('form-owner-name').value = prop.ownerName || '';
    if (document.getElementById('form-owner-phone1')) document.getElementById('form-owner-phone1').value = prop.ownerPhone1 || '';
    if (document.getElementById('form-owner-phone2')) document.getElementById('form-owner-phone2').value = prop.ownerPhone2 || '';

    if (document.getElementById('form-phase')) document.getElementById('form-phase').value = prop.phase || '';
    if (document.getElementById('form-model')) document.getElementById('form-model').value = prop.model || '';
    if (document.getElementById('form-area')) document.getElementById('form-area').value = prop.area || '';
    if (document.getElementById('form-floor')) document.getElementById('form-floor').value = prop.floor || 'أرضي بحديقة';
    if (document.getElementById('form-view')) document.getElementById('form-view').value = prop.viewType || 'جاردن';
    if (document.getElementById('form-finishing')) document.getElementById('form-finishing').value = prop.finishing || 'سوبر لوكس';
    if (document.getElementById('form-bedrooms')) document.getElementById('form-bedrooms').value = prop.bedrooms || '';
    if (document.getElementById('form-bathrooms')) document.getElementById('form-bathrooms').value = prop.bathrooms || '';
    if (document.getElementById('form-garden-area')) document.getElementById('form-garden-area').value = prop.gardenArea || '';

    if (document.getElementById('form-total-price')) document.getElementById('form-total-price').value = prop.totalPrice || prop.price || '';
    if (document.getElementById('form-paid')) document.getElementById('form-paid').value = prop.paidAmount || '';
    if (document.getElementById('form-over')) document.getElementById('form-over').value = prop.overPrice || '';
    if (document.getElementById('form-remaining')) document.getElementById('form-remaining').value = prop.remainingAmount || '';
    if (document.getElementById('form-deposit')) document.getElementById('form-deposit').value = prop.deposit || '';
    if (document.getElementById('form-annual-inst')) document.getElementById('form-annual-inst').value = prop.annualInstallment || '';
    if (document.getElementById('form-monthly-inst')) document.getElementById('form-monthly-inst').value = prop.monthlyInstallment || '';

    if (document.getElementById('form-landmark')) document.getElementById('form-landmark').value = prop.landmark || '';
    if (document.getElementById('form-location-link')) document.getElementById('form-location-link').value = prop.locationLink || '';
    if (document.getElementById('form-status')) document.getElementById('form-status').value = prop.propertyStatus || 'جاهز للاستلام';
    if (document.getElementById('form-delivery-date')) document.getElementById('form-delivery-date').value = prop.deliveryDate || '';
    if (document.getElementById('form-desc')) document.getElementById('form-desc').value = prop.description || '';
    
    const lbl = document.getElementById('file-count-label');
    if (lbl) lbl.textContent = 'اختيار صور جديدة (سيتم استبدال القديمة إن وجدت)';
    
    const submitBtn = document.getElementById('form-submit-btn');
    if (submitBtn) {
      const span = submitBtn.querySelector('span:not(.material-symbols-outlined)');
      if (span) span.textContent = 'حفظ التعديلات';
    }
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
        <span class="text-success-green font-bold">متصل بـ Firebase Cloud</span>
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
