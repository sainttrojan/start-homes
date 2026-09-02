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
      const parsed = cfg ? JSON.parse(cfg) : null;
      return parsed;
    } catch(e) { return null; }
  },

  getImgbbKey() {
    const cfg = this.getConfig();
    return cfg ? cfg.imgbbKey : null;
  },

  isConnected() {
    return this.getConfig() !== null;
  },

  saveConfig(configStr, imgbbKey = '') {
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
    
    localStorage.setItem(this.KEY_CONFIG, JSON.stringify({ apiKey, authDomain, projectId, imgbbKey }));
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
try { FirebaseConfig.initApp(); } catch(e) { console.error("Firebase init failed:", e); }

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

  

  async uploadImages(files) {
    if (!files || files.length === 0) return [];
    
    const imgbbKey = FirebaseConfig.getImgbbKey();
    if (!imgbbKey) {
      throw new Error("يرجى إدخال مفتاح ImgBB في الإعدادات أولاً لرفع الصور.");
    }

    const uploadedUrls = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('image', file);
      
      try {
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data && data.success) {
          uploadedUrls.push(data.data.url);
        } else {
          console.error('ImgBB Error:', data);
          throw new Error("فشل رفع بعض الصور، تأكد من صحة مفتاح ImgBB");
        }
      } catch (e) {
        console.error('Error uploading file:', e);
        throw e;
      }
    }
    return uploadedUrls;
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
      purpose: data.purpose || 'بيع',
      address: data.address || '',
      ownerName: data.ownerName || '',
      ownerPhone1: data.ownerPhone1 || '',
      ownerPhone2: data.ownerPhone2 || '',
      
      phase: data.phase || '',
      model: data.model || '',
      area: Number(data.area) || 0,
      floor: data.floor || '',
      viewType: data.viewType || '',
      finishing: data.finishing || '',
      bedrooms: Number(data.bedrooms) || 0,
      bathrooms: Number(data.bathrooms) || 0,
      gardenArea: Number(data.gardenArea) || 0,

      totalPrice: Number(data.totalPrice) || 0,
      paidAmount: Number(data.paidAmount) || 0,
      overPrice: Number(data.overPrice) || 0,
      remainingAmount: Number(data.remainingAmount) || 0,
      deposit: Number(data.deposit) || 0,
      annualInstallment: Number(data.annualInstallment) || 0,
      monthlyInstallment: Number(data.monthlyInstallment) || 0,

      landmark: data.landmark || '',
      locationLink: data.locationLink || '',
      propertyStatus: data.propertyStatus || 'جاهز للاستلام',
      deliveryDate: data.deliveryDate || '',
      description: data.description || '',

      images: sanitizeImagesList(data.images),
      createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString()
    };
  },


  mapPropertyToDb(p) {
    return {
      purpose: p.purpose || 'بيع',
      address: p.address || '',
      ownerName: p.ownerName || '',
      ownerPhone1: p.ownerPhone1 || '',
      ownerPhone2: p.ownerPhone2 || '',
      
      phase: p.phase || '',
      model: p.model || '',
      area: Number(p.area) || 0,
      floor: p.floor || '',
      viewType: p.viewType || '',
      finishing: p.finishing || '',
      bedrooms: Number(p.bedrooms) || 0,
      bathrooms: Number(p.bathrooms) || 0,
      gardenArea: Number(p.gardenArea) || 0,

      totalPrice: Number(p.totalPrice) || 0,
      paidAmount: Number(p.paidAmount) || 0,
      overPrice: Number(p.overPrice) || 0,
      remainingAmount: Number(p.remainingAmount) || 0,
      deposit: Number(p.deposit) || 0,
      annualInstallment: Number(p.annualInstallment) || 0,
      monthlyInstallment: Number(p.monthlyInstallment) || 0,

      landmark: p.landmark || '',
      locationLink: p.locationLink || '',
      propertyStatus: p.propertyStatus || 'جاهز للاستلام',
      deliveryDate: p.deliveryDate || '',
      description: p.description || '',

      images: sanitizeImagesList(p.images)
    };
  }
};

if (typeof window !== 'undefined') {
  window.FirebaseConfig = FirebaseConfig;
  window.AuthService = AuthService;
  window.DataService = DataService;
}
