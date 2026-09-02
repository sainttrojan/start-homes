#!/bin/bash
awk '
BEGIN { skip = 0 }
/!-- PANEL 5: Supabase Connection Settings --/ {
    skip = 1
    print "      <!-- PANEL 5: Firebase Connection Settings -->"
    print "      <div id=\"panel-settings\" class=\"admin-panel hidden bg-pure-white rounded-3xl border border-border-gray p-6 sm:p-8 shadow-sm space-y-8\">"
    print "        <div>"
    print "          <h2 class=\"font-bold text-xl text-on-surface flex items-center gap-2\">"
    print "            <span class=\"material-symbols-outlined text-primary\">cloud_sync</span>"
    print "            <span>إعدادات الربط مع قاعدة بيانات Firebase</span>"
    print "          </h2>"
    print "          <p class=\"text-xs text-secondary mt-1\">قم بلصق كود إعدادات Firebase لربط مشروعك بقاعدة البيانات السحابية.</p>"
    print "        </div>"
    print ""
    print "        <div class=\"space-y-4 bg-surface-container-low p-5 rounded-2xl border border-border-gray\">"
    print "          <div>"
    print "            <label class=\"block text-xs font-bold text-on-surface mb-1\">كود إعدادات Firebase (firebaseConfig)</label>"
    print "            <textarea id=\"firebase-config-input\" placeholder=\"ألصق كود الإعدادات هنا...\" class=\"input-field w-full p-3 rounded-xl text-xs font-mono min-h-[150px]\" dir=\"ltr\"></textarea>"
    print "          </div>"
    print "          <button id=\"firebase-save-btn\" class=\"btn-primary px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2\">"
    print "            <span class=\"material-symbols-outlined text-base\">check</span>"
    print "            <span>حفظ وتحديث الاتصال</span>"
    print "          </button>"
    print "        </div>"
    print ""
    print "        <div class=\"bg-surface-container p-5 rounded-2xl border border-border-gray\">"
    print "          <div class=\"mb-3\">"
    print "            <h3 class=\"font-bold text-sm text-on-surface\">ملاحظات قواعد الأمان Firestore Rules</h3>"
    print "            <p class=\"text-xs text-secondary mt-1\">تأكد من وضع هذه القواعد في تبويب Rules في Firestore لضمان الحماية:</p>"
    print "          </div>"
    print "          <div class=\"relative\">"
    print "            <pre class=\"bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-xl text-[11px] font-mono overflow-x-auto text-left\" dir=\"ltr\"><code>rules_version = '\''2'\'';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /properties/{document} {\n      allow read: if true;\n      allow write: if request.auth != null;\n    }\n    match /inquiries/{document} {\n      allow create: if true;\n      allow read, update, delete: if request.auth != null;\n    }\n    match /seller_requests/{document} {\n      allow create: if true;\n      allow read, update, delete: if request.auth != null;\n    }\n  }\n}</code></pre>"
    print "          </div>"
    print "        </div>"
    print "      </div>"
}
/<\/main>/ {
    if (skip == 1) {
        skip = 0
    }
}
{
    if (skip == 0) {
        print $0
    }
}
' admin.html > admin_fixed.html
mv admin_fixed.html admin.html
