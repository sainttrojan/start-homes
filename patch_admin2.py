import re

with open('js/admin.js', 'r', encoding='utf-8') as f:
    content = f.read()

bindPropertyForm = """  bindPropertyForm() {
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
  },"""

content = re.sub(r'  bindPropertyForm\(\) {.*?},\n\n  editProperty\(id\) {', bindPropertyForm + "\n\n  editProperty(id) {", content, flags=re.DOTALL)

editProperty = """  editProperty(id) {
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
  },"""

content = re.sub(r'  editProperty\(id\) {.*?},\n\n  async deleteProperty', editProperty + "\n\n  async deleteProperty", content, flags=re.DOTALL)

with open('js/admin.js', 'w', encoding='utf-8') as f:
    f.write(content)
