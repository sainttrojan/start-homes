# Start Homes - المنصة العقارية الذكية 🏠

منصة عقارية متكاملة (CRM + واجهة مستخدم) تم بناؤها باستخدام تقنيات حديثة وخفيفة، لتعمل بكفاءة عالية وبدون أي تكاليف تشغيلية (100% Free Architecture).

## 🚀 التقنيات المستخدمة

- **الواجهة الأمامية (Frontend):** HTML5, Vanilla JavaScript, Tailwind CSS (عبر CDN)
- **قاعدة البيانات (Database):** Firebase Firestore (NoSQL)
- **المصادقة والأمان (Authentication):** Firebase Authentication
- **استضافة الصور (Image Hosting):** ImgBB API (مجاني ولا يتطلب بطاقة ائتمانية)
- **الاستضافة (Hosting):** Cloudflare Pages (مرتبط بـ GitHub)

## 🌟 مميزات النظام

1. **لوحة تحكم (CRM) متكاملة:**
   - إضافة/تعديل/حذف العقارات بتفاصيل مالية دقيقة (إجمالي، مدفوع، أوفر، متبقي، أقساط).
   - استقبال وتصفح رسائل العملاء (Inquiries).
   - استقبال طلبات بيع العقارات من الملاك (Seller Requests) وإمكانية نشرها مباشرة بضغطة زر.
   - حماية كاملة للوحة التحكم؛ لا يمكن الوصول إليها أو إرسال بيانات لقاعدة البيانات إلا بعد تسجيل الدخول كمدير.

2. **نظام استضافة الصور الذكي:**
   - بدلاً من استخدام Firebase Storage الذي يتطلب تفعيل نظام الفوترة (Blaze Plan) ببطاقة بنكية، تم دمج نظام **ImgBB API**.
   - يتم رفع الصور مباشرة من جهازك إلى خوادم ImgBB، ويتم حفظ الرابط السريع للصورة داخل قاعدة بيانات Firebase تلقائياً.

3. **واجهة مستخدم عصرية (Dark/Light Mode):**
   - تصميم متجاوب (Responsive) يعمل على جميع الشاشات.
   - نظام فلترة وبحث متقدم.
   - نظام "المفضلة" لحفظ العقارات في ذاكرة المتصفح.

## 🛠️ إعداد المشروع لأول مرة (Setup)

لكي يعمل النظام بشكل صحيح، يجب ربطه بقاعدة البيانات وسيرفر الصور الخاص بك:

### 1. إعداد Firebase
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/).
2. أنشئ مشروعاً جديداً، وقم بتفعيل **Firestore Database** و **Authentication** (اختر Email/Password).
3. في تبويب **Firestore Database**، اذهب إلى (Rules) والصق قواعد الأمان التالية:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /properties/{document=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
       match /inquiries/{document=**} {
         allow read: if request.auth != null;
         allow write: if true;
       }
       match /seller_requests/{document=**} {
         allow read: if request.auth != null;
         allow write: if true;
       }
     }
   }
   ```
4. اذهب إلى إعدادات المشروع (Project Settings) وانسخ كود `firebaseConfig`.

### 2. إعداد ImgBB للصور
1. اذهب إلى [ImgBB API](https://api.imgbb.com/).
2. سجل حساباً مجانياً واضغط على (Create App) لتحصل على `API Key`.

### 3. ربط الموقع
1. افتح صفحة `admin.html` في موقعك.
2. في شاشة تسجيل الدخول، اضغط على **(⚙️ تحديث إعدادات Firebase)**.
3. الصق كود `firebaseConfig` ومفتاح `ImgBB API Key` واضغط **حفظ**.
4. سيتم تحديث الصفحة، وبعدها يمكنك تسجيل الدخول باستخدام الإيميل والباسورد الخاصين بك كمدير.

## 📁 هيكل الملفات الرئيسي

- `index.html` - الصفحة الرئيسية (الرؤية، البحث السريع).
- `latest-units.html` - صفحة تصفح أحدث الوحدات والفلترة.
- `property-details.html` - صفحة تفاصيل العقار (تعرض التقسيمة المالية، الصور، الوصف).
- `sell-property.html` - صفحة طلبات الملاك لعرض عقاراتهم للبيع.
- `admin.html` - لوحة تحكم الإدارة (CRM).
- `js/firebase-config.js` - محرك الاتصال بقاعدة البيانات ورفع الصور لـ ImgBB.
- `js/admin.js` - منطق لوحة التحكم (إضافة العقارات، عرض الطلبات).

## 💡 ملاحظات التطوير
- تم استخدام `localStorage` لحفظ إعدادات Firebase محلياً لسهولة التحديث من لوحة الإدارة دون الحاجة لتعديل الأكواد البرمجية مباشرة.
- يتم تجاوز الكاش (Cache Busting) في الروابط (مثل `?v=FINAL_VERSION`) لضمان وصول التحديثات للمتصفح فوراً.
