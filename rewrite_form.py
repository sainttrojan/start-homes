import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

new_form = """      <!-- PANEL 2: Add/Edit Property -->
      <div id="panel-add-property" class="admin-panel hidden bg-pure-white rounded-3xl border border-border-gray p-6 sm:p-8 shadow-sm">
        <div class="border-b border-border-gray pb-4 mb-6">
          <h2 class="font-bold text-xl text-on-surface">إضافة / تعديل بيانات الوحدة</h2>
          <p class="text-xs text-secondary mt-1">أدخل بيانات الوحدة بدقة لتظهر في قاعدة البيانات.</p>
        </div>

        <form id="property-form" class="space-y-8">
          
          <!-- Section 1: Basic Info -->
          <div>
            <h3 class="font-bold text-sm text-primary mb-4 border-b border-border-gray pb-2">البيانات الأساسية (مخفية عن الزوار)</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-[11px] font-bold text-secondary mb-1">الغرض</label>
                <select id="form-purpose" class="input-field w-full p-2.5 rounded-xl text-xs">
                  <option value="بيع - كاش">بيع - كاش</option>
                  <option value="بيع - تقسيط">بيع - تقسيط</option>
                  <option value="إيجار">إيجار</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-secondary mb-1">العنوان / المنطقة</label>
                <input id="form-address" type="text" placeholder="مثال: B1 - مجموعة 11" class="input-field w-full p-2.5 rounded-xl text-xs" required/>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-secondary mb-1">اسم المالك</label>
                <input id="form-owner-name" type="text" class="input-field w-full p-2.5 rounded-xl text-xs"/>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-secondary mb-1">الموبايل 1</label>
                <input id="form-owner-phone1" type="text" dir="ltr" class="input-field w-full p-2.5 rounded-xl text-xs text-right"/>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-secondary mb-1">الموبايل 2</label>
                <input id="form-owner-phone2" type="text" dir="ltr" class="input-field w-full p-2.5 rounded-xl text-xs text-right"/>
              </div>
            </div>
          </div>

          <!-- Section 2: Unit Details -->
          <div>
            <h3 class="font-bold text-sm text-primary mb-4 border-b border-border-gray pb-2">تفاصيل الوحدة</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              <div>
                <label class="block text-[11px] font-bold text-secondary mb-1">المرحلة</label>
                <input id="form-phase" type="text" class="input-field w-full p-2.5 rounded-xl text-xs"/>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-secondary mb-1">النموذج</label>
                <input id="form-model" type="text" class="input-field w-full p-2.5 rounded-xl text-xs"/>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-secondary mb-1">المساحة (م²)</label>
                <input id="form-area" type="number" class="input-field w-full p-2.5 rounded-xl text-xs"/>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-secondary mb-1">الدور</label>
                <select id="form-floor" class="input-field w-full p-2.5 rounded-xl text-xs">
                  <option value="أرضي بحديقة">أرضي بحديقة</option>
                  <option value="أرضي بدون حديقة">أرضي بدون حديقة</option>
                  <option value="الأول">الأول</option>
                  <option value="الثاني">الثاني</option>
                  <option value="الثالث">الثالث</option>
                  <option value="الرابع">الرابع</option>
                  <option value="الخامس">الخامس</option>
                  <option value="السادس">السادس</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-secondary mb-1">الفيو</label>
                <select id="form-view" class="input-field w-full p-2.5 rounded-xl text-xs">
                  <option value="جاردن">جاردن</option>
                  <option value="شارع">شارع</option>
                  <option value="وايد جاردن">وايد جاردن</option>
                  <option value="بارك">بارك</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-secondary mb-1">التشطيب</label>
                <select id="form-finishing" class="input-field w-full p-2.5 rounded-xl text-xs">
                  <option value="سوبر لوكس">سوبر لوكس</option>
                  <option value="نصف تشطيب">نصف تشطيب</option>
                  <option value="بدون تشطيب">بدون تشطيب</option>
                  <option value="شركة">تشطيب شركة</option>
                  <option value="خاص">تشطيب خاص</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-secondary mb-1">غرف النوم</label>
                <input id="form-bedrooms" type="number" class="input-field w-full p-2.5 rounded-xl text-xs"/>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-secondary mb-1">الحمامات</label>
                <input id="form-bathrooms" type="number" class="input-field w-full p-2.5 rounded-xl text-xs"/>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-secondary mb-1">مساحة الحديقة</label>
                <input id="form-garden-area" type="number" class="input-field w-full p-2.5 rounded-xl text-xs"/>
              </div>
            </div>
          </div>

          <!-- Section 3: Financials -->
          <div>
            <h3 class="font-bold text-sm text-primary mb-4 border-b border-border-gray pb-2">التفاصيل المالية</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
              <div>
                <label class="block text-[11px] font-bold text-secondary mb-1">إجمالي العقد</label>
                <input id="form-total-price" type="number" class="input-field w-full p-2.5 rounded-xl text-xs font-bold text-primary"/>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-secondary mb-1">المدفوع</label>
                <input id="form-paid" type="number" class="input-field w-full p-2.5 rounded-xl text-xs"/>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-secondary mb-1">الأوفر</label>
                <input id="form-over" type="number" class="input-field w-full p-2.5 rounded-xl text-xs text-badge-gold-text bg-badge-gold/20"/>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-secondary mb-1">المتبقي</label>
                <input id="form-remaining" type="number" class="input-field w-full p-2.5 rounded-xl text-xs bg-surface-container"/>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-secondary mb-1">الوديعة</label>
                <input id="form-deposit" type="number" class="input-field w-full p-2.5 rounded-xl text-xs"/>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-secondary mb-1">قسط سنوي</label>
                <input id="form-annual-inst" type="number" class="input-field w-full p-2.5 rounded-xl text-xs"/>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-secondary mb-1">قسط شهري</label>
                <input id="form-monthly-inst" type="number" class="input-field w-full p-2.5 rounded-xl text-xs"/>
              </div>
            </div>
          </div>

          <!-- Section 4: Extra Info -->
          <div>
            <h3 class="font-bold text-sm text-primary mb-4 border-b border-border-gray pb-2">معلومات إضافية</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div class="sm:col-span-2">
                <label class="block text-[11px] font-bold text-secondary mb-1">علامة مميزة</label>
                <input id="form-landmark" type="text" class="input-field w-full p-2.5 rounded-xl text-xs"/>
              </div>
              <div class="sm:col-span-2">
                <label class="block text-[11px] font-bold text-secondary mb-1">رابط اللوكيشن</label>
                <input id="form-location-link" type="text" dir="ltr" class="input-field w-full p-2.5 rounded-xl text-xs text-right"/>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-secondary mb-1">حالة العقار</label>
                <select id="form-status" class="input-field w-full p-2.5 rounded-xl text-xs">
                  <option value="جاهز للاستلام">جاهز للاستلام</option>
                  <option value="تحت الإنشاء">تحت الإنشاء</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-secondary mb-1">تاريخ الاستلام</label>
                <input id="form-delivery-date" type="date" class="input-field w-full p-2.5 rounded-xl text-xs text-right"/>
              </div>
            </div>
            
            <label class="block text-[11px] font-bold text-secondary mb-1">الملاحظات / الوصف التفصيلي</label>
            <textarea id="form-desc" rows="4" placeholder="اكتب أي ملاحظات إضافية هنا..." class="input-field w-full p-3 rounded-xl text-xs resize-none"></textarea>
          </div>

          <!-- Section 5: Media (Firebase Storage) -->
          <div>
            <h3 class="font-bold text-sm text-primary mb-4 border-b border-border-gray pb-2">صور العقار (Firebase Storage)</h3>
            <div class="border-2 border-dashed border-border-gray rounded-xl p-8 text-center bg-surface-container-low hover:bg-surface-container transition-colors relative cursor-pointer" onclick="document.getElementById('form-images').click()">
              <input type="file" id="form-images" multiple accept="image/*" class="hidden" onchange="document.getElementById('file-count-label').textContent = this.files.length > 0 ? `تم اختيار ${this.files.length} صورة` : 'اضغط هنا لاختيار صور من جهازك'"/>
              <span class="material-symbols-outlined text-4xl text-secondary mb-2">cloud_upload</span>
              <p id="file-count-label" class="text-xs font-bold text-on-surface">اضغط هنا لاختيار صور من جهازك</p>
              <p class="text-[10px] text-secondary mt-1">يمكنك اختيار أكثر من صورة معاً</p>
            </div>
          </div>

          <div class="flex gap-4 pt-4 border-t border-border-gray">
            <button id="form-submit-btn" type="submit" class="btn-primary px-8 py-3.5 rounded-xl text-xs font-bold shadow-md hover-gold-glow flex items-center gap-2">
              <span id="submit-spinner" class="material-symbols-outlined animate-spin hidden">progress_activity</span>
              <span>حفظ بيانات العقار</span>
            </button>
            <button type="button" onclick="AdminApp.switchTab('properties')" class="btn-secondary px-6 py-3.5 rounded-xl text-xs font-bold">
              إلغاء
            </button>
          </div>
        </form>
      </div>"""

pattern = re.compile(r'<!-- PANEL 2: Add/Edit Property -->.*?(?=<!-- PANEL 3: Inquiries -->)', re.DOTALL)
content = re.sub(pattern, new_form + "\n\n      ", content)

# I should also update the Firebase Rules snippet in the settings tab to include storage rules!
rules_replacement = """rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /properties/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /inquiries/{document} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    match /seller_requests/{document} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
</script>
<p class="text-xs text-secondary mt-4 mb-2 font-bold">قواعد حماية تخزين الصور Firebase Storage Rules:</p>
<pre class="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-xl text-[11px] font-mono overflow-x-auto text-left" dir="ltr"><code>rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}</code></pre>"""

content = content.replace("rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /properties/{document} {\n      allow read: if true;\n      allow write: if request.auth != null;\n    }\n    match /inquiries/{document} {\n      allow create: if true;\n      allow read, update, delete: if request.auth != null;\n    }\n    match /seller_requests/{document} {\n      allow create: if true;\n      allow read, update, delete: if request.auth != null;\n    }\n  }\n}", rules_replacement)

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
