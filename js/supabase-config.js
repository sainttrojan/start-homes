/**
 * Start Homes - Cloudflare Pages Optimized Supabase Service
 * Direct secure connection using Supabase RLS policies.
 */

const DEFAULT_PROPERTY_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuDREq9v_PqViSCUwgZ7YBgeZR7WsnKChX9iXdisD0gEgPTnpkagUc0fh4ByL6yb_-KHbhlEEfivbDwUM9igkKubwmBRuOsAxWaLDNPZlu_gw_ubPV5BiutCnR4x-dpMqEfH7ozGZA2zrPj-IDb5fKzfuEFDTtRX9bG4DSR8JeKThzdHMkZPKGv1yT6wes38fIqs9pYEig0GOY6_DznutNL89wG_zLN0o0i1jZtBvqAj6Vh1qtJ9tdWB";

const SupabaseConfig = {
  KEY_URL: 'start_homes_supabase_url',
  KEY_ANON: 'start_homes_supabase_anon_key',
  DEFAULT_URL: 'https://idvlfmdeaqpiopljctma.supabase.co',
  DEFAULT_ANON: 'sb_publishable_4OsuumW8Y44rw43Mbi8iYA_eTBYvAFN',

  getUrl() {
    return localStorage.getItem(this.KEY_URL) || this.DEFAULT_URL;
  },

  getAnonKey() {
    return localStorage.getItem(this.KEY_ANON) || this.DEFAULT_ANON;
  },

  saveCredentials(url, key) {
    localStorage.setItem(this.KEY_URL, url.trim() || this.DEFAULT_URL);
    localStorage.setItem(this.KEY_ANON, key.trim() || this.DEFAULT_ANON);
  }
};

// Supabase Authentication Service (Cloudflare/Frontend Native)
const AuthService = {
  SESSION_KEY: 'start_homes_admin_session',

  getSession() {
    try {
      const s = localStorage.getItem(this.SESSION_KEY);
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  },

  getUser() {
    const session = this.getSession();
    return session ? session.user : null;
  },

  isAuthenticated() {
    const s = this.getSession();
    return Boolean(s && s.access_token);
  },

  async login(email, password) {
    const base = SupabaseConfig.getUrl();
    const key = SupabaseConfig.getAnonKey();

    const res = await fetch(`${base}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error_description || data.msg || 'بيانات الدخول غير صحيحة');
    }

    localStorage.setItem(this.SESSION_KEY, JSON.stringify(data));
    return { success: true, user: data.user };
  },

  async logout() {
    const base = SupabaseConfig.getUrl();
    const key = SupabaseConfig.getAnonKey();
    const session = this.getSession();
    
    if (session && session.access_token) {
      try {
        await fetch(`${base}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${session.access_token}`
          }
        });
      } catch (e) {}
    }
    localStorage.removeItem(this.SESSION_KEY);
  }
};

// Native REST API Client
const SupabaseApi = {
  getHeaders() {
    const key = SupabaseConfig.getAnonKey();
    const session = AuthService.getSession();
    const token = (session && session.access_token) ? session.access_token : key;

    return {
      'apikey': key,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  },

  async get(endpoint) {
    const base = SupabaseConfig.getUrl();
    const res = await fetch(`${base}/rest/v1/${endpoint}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },

  async post(endpoint, body) {
    const base = SupabaseConfig.getUrl();
    const res = await fetch(`${base}/rest/v1/${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },

  async patch(endpoint, body) {
    const base = SupabaseConfig.getUrl();
    const res = await fetch(`${base}/rest/v1/${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },

  async delete(endpoint) {
    const base = SupabaseConfig.getUrl();
    const res = await fetch(`${base}/rest/v1/${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  }
};

// Helper to sanitize images
function sanitizeImagesList(images) {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return [DEFAULT_PROPERTY_IMAGE];
  }
  const valid = images.filter(url => {
    if (typeof url !== 'string') return false;
    const trimmed = url.trim();
    return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('/');
  });
  return valid.length > 0 ? valid : [DEFAULT_PROPERTY_IMAGE];
}

// DataService Layer
const DataService = {
  LOCAL_STORAGE_PROPS: 'start_homes_custom_properties',
  LOCAL_STORAGE_INQUIRIES: 'start_homes_inquiries',
  LOCAL_STORAGE_SELLERS: 'start_homes_seller_requests',

  async getProperties() {
    try {
      const data = await SupabaseApi.get('properties?select=*&order=id.desc');
      if (Array.isArray(data) && data.length > 0) {
        return data.map(this.mapDbProperty);
      }
    } catch (e) {
      console.warn('API fetch fallback to localStorage:', e);
    }
    return [];
  },

  async getPropertyById(id) {
    if (id !== undefined && id !== null && id !== '') {
      try {
        const data = await SupabaseApi.get(`properties?id=eq.${encodeURIComponent(id)}&select=*`);
        if (Array.isArray(data) && data.length > 0) {
          return this.mapDbProperty(data[0]);
        }
      } catch (e) {
        console.warn('Error fetching single property:', e);
      }
    }
    return null;
  },

  async addProperty(prop) {
    const dbRow = this.mapPropertyToDb(prop);
    try {
      const data = await SupabaseApi.post('properties', [dbRow]);
      if (Array.isArray(data) && data.length > 0) {
        prop.id = data[0].id;
        return { success: true, data: prop };
      }
    } catch (e) {
      console.error('Error adding property:', e);
      throw new Error('لم يتم حفظ العقار لعدم وجود صلاحيات كافية');
    }
  },

  async updateProperty(id, prop) {
    const dbRow = this.mapPropertyToDb(prop);
    try {
      await SupabaseApi.patch(`properties?id=eq.${encodeURIComponent(id)}`, dbRow);
      return { success: true };
    } catch (e) {
      console.error('Error updating property:', e);
      throw new Error('لم يتم تعديل العقار لعدم وجود صلاحيات كافية');
    }
  },

  async deleteProperty(id) {
    try {
      await SupabaseApi.delete(`properties?id=eq.${encodeURIComponent(id)}`);
      return { success: true };
    } catch (e) {
      console.error('Error deleting property:', e);
      throw new Error('لم يتم حذف العقار لعدم وجود صلاحيات كافية');
    }
  },

  async saveInquiry(inquiry) {
    try {
      await SupabaseApi.post('inquiries', [{
        property_title: inquiry.propertyTitle || 'طلب معاينة عام',
        client_name: inquiry.clientName,
        client_phone: inquiry.clientPhone,
        preferred_date: inquiry.preferredDate || null
      }]);
    } catch (e) {
      console.error('Error saving inquiry:', e);
    }
  },

  async getInquiries() {
    try {
      const data = await SupabaseApi.get('inquiries?select=*&order=id.desc');
      if (Array.isArray(data)) {
        return data.map(d => ({
          id: d.id,
          propertyTitle: d.property_title,
          clientName: d.client_name,
          clientPhone: d.client_phone,
          preferredDate: d.preferred_date,
          status: d.status,
          createdAt: d.created_at
        }));
      }
    } catch (e) {
      console.warn('Error fetching inquiries:', e);
    }
    return [];
  },

  async saveSellerRequest(req) {
    try {
      await SupabaseApi.post('seller_requests', [{
        owner_name: req.ownerName,
        owner_phone: req.ownerPhone,
        city: req.city,
        compound: req.compound || '',
        unit_type: req.unitType,
        area: Number(req.area) || 0,
        bedrooms: Number(req.bedrooms) || 0,
        bathrooms: Number(req.bathrooms) || 0,
        floor: req.floor || '',
        finishing: req.finishing || '',
        price_total: Number(req.priceTotal) || 0,
        price_cash: Number(req.priceCash) || 0,
        notes: req.notes || ''
      }]);
    } catch (e) {
      console.error('Error saving seller request:', e);
    }
  },

  async getSellerRequests() {
    try {
      const data = await SupabaseApi.get('seller_requests?select=*&order=id.desc');
      if (Array.isArray(data)) {
        return data.map(d => ({
          id: d.id,
          ownerName: d.owner_name,
          ownerPhone: d.owner_phone,
          city: d.city,
          compound: d.compound,
          unitType: d.unit_type,
          area: d.area,
          bedrooms: d.bedrooms,
          bathrooms: d.bathrooms,
          floor: d.floor,
          finishing: d.finishing,
          priceTotal: d.price_total,
          priceCash: d.price_cash,
          notes: d.notes,
          status: d.status,
          createdAt: d.created_at
        }));
      }
    } catch (e) {
      console.warn('Error fetching seller requests:', e);
    }
    return [];
  },

  mapDbProperty(row) {
    return {
      id: row.id,
      title: row.title,
      subtitle: row.subtitle || '',
      city: row.city,
      district: row.district || row.city,
      type: row.type || 'شقة',
      price: Number(row.price) || 0,
      originalPrice: Number(row.original_price) || Number(row.price),
      downPayment: Number(row.down_payment) || 0,
      installmentPlan: row.installment_plan || 'كاش',
      bedrooms: row.bedrooms || 3,
      bathrooms: row.bathrooms || 2,
      area: Number(row.area) || 140,
      floor: row.floor || 'الدور الثاني',
      finishing: row.finishing || 'سوبر لوكس',
      elevator: Boolean(row.elevator),
      viewType: row.view_type || 'إطلالة مفتوحة',
      isDeal: Boolean(row.is_deal),
      discountPercent: row.discount_percent || 0,
      isExclusive: Boolean(row.is_exclusive),
      isNew: Boolean(row.is_new),
      isReady: Boolean(row.is_ready),
      legalCheck: Boolean(row.legal_check),
      images: sanitizeImagesList(row.images),
      description: row.description || ''
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
      original_price: Number(p.originalPrice) || Number(p.price),
      down_payment: Number(p.downPayment) || 0,
      installment_plan: p.installmentPlan || 'كاش',
      bedrooms: Number(p.bedrooms) || 3,
      bathrooms: Number(p.bathrooms) || 2,
      area: Number(p.area) || 140,
      floor: p.floor || 'الدور الثاني',
      finishing: p.finishing || 'سوبر لوكس',
      elevator: Boolean(p.elevator),
      view_type: p.viewType || 'إطلالة مفتوحة',
      is_deal: Boolean(p.isDeal),
      discount_percent: Number(p.discountPercent) || 0,
      is_exclusive: Boolean(p.isExclusive),
      is_new: Boolean(p.isNew),
      is_ready: Boolean(p.isReady),
      legal_check: Boolean(p.legalCheck),
      images: sanitizeImagesList(p.images),
      description: p.description || ''
    };
  }
};

if (typeof window !== 'undefined') {
  window.SupabaseConfig = SupabaseConfig;
  window.AuthService = AuthService;
  window.SupabaseApi = SupabaseApi;
  window.DataService = DataService;
}
