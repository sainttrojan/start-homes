import re

with open('js/admin.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace bindPropertyForm
bindPropertyForm = """  bindPropertyForm() {
    const form = document.getElementById('property-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = document.getElementById('form-submit-btn');
      const spinner = document.getElementById('submit-spinner');
      submitBtn.disabled = true;
      spinner.classList.remove('hidden');

      try {
        let uploadedImages = [];
        const fileInput = document.getElementById('form-images');
        if (fileInput && fileInput.files.length > 0) {
          uploadedImages = await DataService.uploadImages(fileInput.files);
        }

        const propData = {
          purpose: document.getElementById('form-purpose').value,
          address: document.getElementById('form-address').value.trim(),
          ownerName: document.getElementById('form-owner-name').value.trim(),
          ownerPhone1: document.getElementById('form-owner-phone1').value.trim(),
          ownerPhone2: document.getElementById('form-owner-phone2').value.trim(),

          phase: document.getElementById('form-phase').value.trim(),
          model: document.getElementById('form-model').value.trim(),
          area: Number(document.getElementById('form-area').value),
          floor: document.getElementById('form-floor').value,
          viewType: document.getElementById('form-view').value,
          finishing: document.getElementById('form-finishing').value,
          bedrooms: Number(document.getElementById('form-bedrooms').value),
          bathrooms: Number(document.getElementById('form-bathrooms').value),
          gardenArea: Number(document.getElementById('form-garden-area').value),

          totalPrice: Number(document.getElementById('form-total-price').value),
          paidAmount: Number(document.getElementById('form-paid').value),
          overPrice: Number(document.getElementById('form-over').value),
          remainingAmount: Number(document.getElementById('form-remaining').value),
          deposit: Number(document.getElementById('form-deposit').value),
          annualInstallment: Number(document.getElementById('form-annual-inst').value),
          monthlyInstallment: Number(document.getElementById('form-monthly-inst').value),

          landmark: document.getElementById('form-landmark').value.trim(),
          locationLink: document.getElementById('form-location-link').value.trim(),
          propertyStatus: document.getElementById('form-status').value,
          deliveryDate: document.getElementById('form-delivery-date').value,
          description: document.getElementById('form-desc').value.trim(),
        };

        if (uploadedImages.length > 0) {
          propData.images = uploadedImages;
        }

        if (this.editingPropertyId) {
          // If editing and no new images were uploaded, we don't overwrite existing images in DB
          if (uploadedImages.length === 0) {
             const existing = await DataService.getPropertyById(this.editingPropertyId);
             if (existing && existing.images) propData.images = existing.images;
          }
          await DataService.updateProperty(this.editingPropertyId, propData);
          showToast('تم التحديث بنجاح!', 'success');
          this.editingPropertyId = null;
        } else {
          await DataService.addProperty(propData);
          showToast('تمت الإضافة بنجاح!', 'success');
        }

        form.reset();
        document.getElementById('file-count-label').textContent = 'اضغط هنا لاختيار صور من جهازك';
        await this.refreshData();
        this.switchTab('properties');
      } catch (err) {
        showToast(err.message || 'حدث خطأ أثناء الحفظ', 'error');
      } finally {
        submitBtn.disabled = false;
        spinner.classList.add('hidden');
      }
    });
  },"""

content = re.sub(r'  bindPropertyForm\(\) {.*?},\n\n  bindAuth', bindPropertyForm + "\n\n  bindAuth", content, flags=re.DOTALL)

# Replace editProperty population logic
editProperty = """  async editProperty(id) {
    const prop = this.properties.find(p => p.id === id);
    if (!prop) return;

    this.editingPropertyId = id;
    this.switchTab('add-property');

    document.getElementById('form-purpose').value = prop.purpose || 'بيع - كاش';
    document.getElementById('form-address').value = prop.address || '';
    document.getElementById('form-owner-name').value = prop.ownerName || '';
    document.getElementById('form-owner-phone1').value = prop.ownerPhone1 || '';
    document.getElementById('form-owner-phone2').value = prop.ownerPhone2 || '';

    document.getElementById('form-phase').value = prop.phase || '';
    document.getElementById('form-model').value = prop.model || '';
    document.getElementById('form-area').value = prop.area || '';
    document.getElementById('form-floor').value = prop.floor || 'أرضي بحديقة';
    document.getElementById('form-view').value = prop.viewType || 'جاردن';
    document.getElementById('form-finishing').value = prop.finishing || 'سوبر لوكس';
    document.getElementById('form-bedrooms').value = prop.bedrooms || '';
    document.getElementById('form-bathrooms').value = prop.bathrooms || '';
    document.getElementById('form-garden-area').value = prop.gardenArea || '';

    document.getElementById('form-total-price').value = prop.totalPrice || prop.price || '';
    document.getElementById('form-paid').value = prop.paidAmount || '';
    document.getElementById('form-over').value = prop.overPrice || '';
    document.getElementById('form-remaining').value = prop.remainingAmount || '';
    document.getElementById('form-deposit').value = prop.deposit || '';
    document.getElementById('form-annual-inst').value = prop.annualInstallment || '';
    document.getElementById('form-monthly-inst').value = prop.monthlyInstallment || '';

    document.getElementById('form-landmark').value = prop.landmark || '';
    document.getElementById('form-location-link').value = prop.locationLink || '';
    document.getElementById('form-status').value = prop.propertyStatus || 'جاهز للاستلام';
    document.getElementById('form-delivery-date').value = prop.deliveryDate || '';
    document.getElementById('form-desc').value = prop.description || '';
    
    document.getElementById('file-count-label').textContent = 'اختيار صور جديدة (سيتم استبدال القديمة إن وجدت)';
    
    document.getElementById('form-submit-btn').querySelector('span:not(.material-symbols-outlined)').textContent = 'حفظ التعديلات';
  },"""

content = re.sub(r'  async editProperty\(id\) {.*?},\n\n  async deleteProperty', editProperty + "\n\n  async deleteProperty", content, flags=re.DOTALL)

with open('js/admin.js', 'w', encoding='utf-8') as f:
    f.write(content)
