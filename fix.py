import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'<!-- PANEL 5: Firebase Connection Settings -->.*?</main>', re.DOTALL)
replacement = """<!-- PANEL 5: Firebase Connection Settings -->
      <div id="panel-settings" class="admin-panel hidden bg-pure-white rounded-3xl border border-border-gray p-6 sm:p-8 shadow-sm space-y-8">
        <div>
          <h2 class="font-bold text-xl text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">cloud_sync</span>
            <span>إعدادات الربط مع قاعدة بيانات Firebase</span>
          </h2>
          <p class="text-xs text-secondary mt-1">قم بلصق كود إعدادات Firebase لربط مشروعك بقاعدة البيانات السحابية.</p>
        </div>

        <div class="space-y-4 bg-surface-container-low p-5 rounded-2xl border border-border-gray">
          <div>
            <label class="block text-xs font-bold text-on-surface mb-1">كود إعدادات Firebase (firebaseConfig)</label>
            <textarea id="firebase-config-input" placeholder="ألصق كود الإعدادات هنا..." class="input-field w-full p-3 rounded-xl text-xs font-mono min-h-[150px]" dir="ltr"></textarea>
          </div>

          <button id="firebase-save-btn" class="btn-primary px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
            <span class="material-symbols-outlined text-base">check</span>
            <span>حفظ وتحديث الاتصال</span>
          </button>
        </div>

        <div class="bg-surface-container p-5 rounded-2xl border border-border-gray">
          <div class="mb-3">
            <h3 class="font-bold text-sm text-on-surface">ملاحظات قواعد الأمان Firestore Rules</h3>
            <p class="text-xs text-secondary mt-1">تأكد من وضع القواعد التالية في تبويب Rules في Firestore لضمان الحماية:</p>
          </div>
          <div class="relative">
            <pre class="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-xl text-[11px] font-mono overflow-x-auto text-left" dir="ltr"><code>rules_version = '2';
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
}</code></pre>
          </div>
        </div>
      </div>
    </main>"""

new_content = re.sub(pattern, replacement, content)

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(new_content)
