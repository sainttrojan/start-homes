/**
 * Start Homes - Firebase Configuration & Services
 */

const DEFAULT_PROPERTY_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuDREq9v_PqViSCUwgZ7YBgeZR7WsnKChX9iXdisD0gEgPTnpkagUc0fh4ByL6yb_-KHbhlEEfivbDwUM9igkKubwmBRuOsAxWaLDNPZlu_gw_ubPV5BiutCnR4x-dpMqEfH7ozGZA2zrPj-IDb5fKzfuEFDTtRX9bG4DSR8JeKThzdHMkZPKGv1yT6wes38fIqs9pYEig0GOY6_DznutNL89wG_zLN0o0i1jZtBvqAj6Vh1qtJ9tdWB";

// Firebase Local Config Storage (so admin can set it up from UI)
const FirebaseConfig = {
  KEY_CONFIG: 'start_homes_firebase_config',
  
  getConfig() {
    try {
      const cfg = localStorage.getItem(this.KEY_CONFIG);
      return cfg ? JSON.parse(cfg) : null;
    } catch(e) { return null; }
  },

  isConnected() {
    return this.getConfig() !== null;
  },

  saveConfig(configStr) {
    // Basic extraction from pasted config
    let apiKey = (configStr.match(/apiKey:\s*["']([^"']+)["']/) || [])[1];
    let authDomain = (configStr.match(/authDomain:\s*["']([^"']+)["']/) || [])[1];
    let projectId = (configStr.match(/projectId:\s*["']([^"']+)["']/) || [])[1];
    
    if(!apiKey || !projectId) {
      // Try parsing as raw JSON
      try {
        const j = JSON.parse(configStr);
        if(j.apiKey && j.projectId) {
          apiKey = j.apiKey;
          authDomain = j.authDomain;
          projectId = j.projectId;
        }
      } catch(e){}
    }

    if (!apiKey || !projectId) throw new Error("بيانات Firebase غير صالحة");
    
    localStorage.setItem(this.KEY_CONFIG, JSON.stringify({ apiKey, authDomain, projectId }));
    return true;
  },

  initApp() {
    const cfg = this.getConfig();
    if (!cfg) {
      console.warn("Firebase config not found in localStorage. App will not connect to DB.");
      return null;
    }
    
    if (!firebase.apps.length) {
      firebase.initializeApp(cfg);
    }
    return firebase.app();
  }
};

// Initialize early
FirebaseConfig.initApp();

// Auth Service
const AuthService = {
  getUser() {
    return firebase.auth().currentUser;
  },
  
  isAuthenticated() {
    return !!firebase.auth().currentUser;
  },

  async login(email, password) {
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      return { success: true };
    } catch (e) {
      throw new Error(e.message || 'بيانات الدخول غير صحيحة');
    }
  },

  async logout() {
    await firebase.auth().signOut();
  },
  
  onAuthStateChanged(callback) {
    firebase.auth().onAuthStateChanged(callback);
  }
};

// Helper for images
function sanitizeImagesList(images) {
  if (!images || !Array.isArray(images) || images.length === 0) return [DEFAULT_PROPERTY_IMAGE];
  const valid = images.filter(url => typeof url === 'string' && url.trim().length > 0);
  return valid.length > 0 ? valid : [DEFAULT_PROPERTY_IMAGE];
}

// DataService Layer using Firestore
const DataService = {
  get db() {
    return firebase.firestore();
  },

  async getProperties() {
    if (!firebase.apps.length) return [];
    try {
      const snap = await this.db.collection('properties').orderBy('createdAt', 'desc').get();
      return snap.docs.map(doc => this.mapDbProperty(doc.id, doc.data()));
    } catch (e) {
      console.error('Error fetching properties:', e);
      return [];
    }
  },

  async getPropertyById(id) {
    if (!id || !firebase.apps.length) return null;
    try {
      const doc = await this.db.collection('properties').doc(id).get();
      if (doc.exists) {
        return this.mapDbProperty(doc.id, doc.data());
      }
    } catch (e) {
      console.error('Error fetching property:', e);
    }
    return null;
  },

  async addProperty(prop) {
    const dbData = this.mapPropertyToDb(prop);
    dbData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    try {
      const docRef = await this.db.collection('properties').add(dbData);
      prop.id = docRef.id;
      return { success: true, data: prop };
    } catch (e) {
      console.error('Error adding property:', e);
      throw new Error('لم يتم حفظ العقار، تأكد من تسجيل الدخول كمدير.');
    }
  },

  async updateProperty(id, prop) {
    const dbData = this.mapPropertyToDb(prop);
    try {
      await this.db.collection('properties').doc(id).update(dbData);
      return { success: true };
    } catch (e) {
      console.error('Error updating property:', e);
      throw new Error('فشل التعديل، تأكد من الصلاحيات.');
    }
  },

  async deleteProperty(id) {
    try {
      await this.db.collection('properties').doc(id).delete();
      return { success: true };
    } catch (e) {
      console.error('Error deleting property:', e);
      throw new Error('فشل الحذف، تأكد من الصلاحيات.');
    }
  },

  async saveInquiry(inquiry) {
    if (!firebase.apps.length) return;
    try {
      await this.db.collection('inquiries').add({
        propertyTitle: inquiry.propertyTitle || 'طلب معاينة عام',
        clientName: inquiry.clientName,
        clientPhone: inquiry.clientPhone,
        preferredDate: inquiry.preferredDate || null,
        status: 'جديد',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (e) {
      console.error('Error saving inquiry:', e);
    }
  },

  async getInquiries() {
    if (!firebase.apps.length) return [];
    try {
      const snap = await this.db.collection('inquiries').orderBy('createdAt', 'desc').get();
      return snap.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          createdAt: d.createdAt ? d.createdAt.toDate().toISOString() : new Date().toISOString()
        };
      });
    } catch (e) {
      console.warn('Error fetching inquiries:', e);
      return [];
    }
  },

  async saveSellerRequest(req) {
    if (!firebase.apps.length) return;
    try {
      await this.db.collection('seller_requests').add({
        ownerName: req.ownerName,
        ownerPhone: req.ownerPhone,
        city: req.city,
        compound: req.compound || '',
        unitType: req.unitType,
        area: Number(req.area) || 0,
        bedrooms: Number(req.bedrooms) || 0,
        bathrooms: Number(req.bathrooms) || 0,
        floor: req.floor || '',
        finishing: req.finishing || '',
        priceTotal: Number(req.priceTotal) || 0,
        priceCash: Number(req.priceCash) || 0,
        notes: req.notes || '',
        status: 'جديد',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (e) {
      console.error('Error saving seller request:', e);
    }
  },

  async getSellerRequests() {
    if (!firebase.apps.length) return [];
    try {
      const snap = await this.db.collection('seller_requests').orderBy('createdAt', 'desc').get();
      return snap.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          createdAt: d.createdAt ? d.createdAt.toDate().toISOString() : new Date().toISOString()
        };
      });
    } catch (e) {
      console.warn('Error fetching seller requests:', e);
      return [];
    }
  },

  mapDbProperty(id, data) {
    return {
      id: id,
      title: data.title,
      subtitle: data.subtitle || '',
      city: data.city,
      district: data.district || data.city,
      type: data.type || 'شقة',
      price: Number(data.price) || 0,
      originalPrice: Number(data.originalPrice) || Number(data.price),
      downPayment: Number(data.downPayment) || 0,
      installmentPlan: data.installmentPlan || 'كاش',
      bedrooms: data.bedrooms || 3,
      bathrooms: data.bathrooms || 2,
      area: Number(data.area) || 140,
      floor: data.floor || 'الدور الثاني',
      finishing: data.finishing || 'سوبر لوكس',
      elevator: Boolean(data.elevator),
      viewType: data.viewType || 'إطلالة مفتوحة',
      isDeal: Boolean(data.isDeal),
      discountPercent: data.discountPercent || 0,
      isExclusive: Boolean(data.isExclusive),
      isNew: Boolean(data.isNew),
      isReady: Boolean(data.isReady),
      legalCheck: Boolean(data.legalCheck),
      images: sanitizeImagesList(data.images),
      description: data.description || ''
    };
  },

  mapPropertyToDb(p) {
    return {
      title: p.title,
      subtitle: p.subtitle || '',
      city: p.city,
      district: p.district || '',
      type: p.type || 'شقة',
      price: Number(p.price) || 0,
      originalPrice: Number(p.originalPrice) || Number(p.price),
      downPayment: Number(p.downPayment) || 0,
      installmentPlan: p.installmentPlan || 'كاش',
      bedrooms: Number(p.bedrooms) || 3,
      bathrooms: Number(p.bathrooms) || 2,
      area: Number(p.area) || 140,
      floor: p.floor || 'الدور الثاني',
      finishing: p.finishing || 'سوبر لوكس',
      elevator: Boolean(p.elevator),
      viewType: p.viewType || 'إطلالة مفتوحة',
      isDeal: Boolean(p.isDeal),
      discountPercent: Number(p.discountPercent) || 0,
      isExclusive: Boolean(p.isExclusive),
      isNew: Boolean(p.isNew),
      isReady: Boolean(p.isReady),
      legalCheck: Boolean(p.legalCheck),
      images: sanitizeImagesList(p.images),
      description: p.description || ''
    };
  }
};

if (typeof window !== 'undefined') {
  window.FirebaseConfig = FirebaseConfig;
  window.AuthService = AuthService;
  window.DataService = DataService;
}
