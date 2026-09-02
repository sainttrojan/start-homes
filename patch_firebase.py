import re

with open('js/firebase-config.js', 'r', encoding='utf-8') as f:
    content = f.read()

storage_methods = """
  get storage() {
    return firebase.storage();
  },

  async uploadImages(files) {
    if (!firebase.apps.length || !files || files.length === 0) return [];
    
    const uploadedUrls = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filename = `properties/${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name}`;
      const storageRef = this.storage.ref(filename);
      
      try {
        const snapshot = await storageRef.put(file);
        const url = await snapshot.ref.getDownloadURL();
        uploadedUrls.push(url);
      } catch (e) {
        console.error('Error uploading file:', e);
      }
    }
    return uploadedUrls;
  },

"""

content = content.replace("async getProperties() {", storage_methods + "  async getProperties() {")

# Update mapDbProperty
new_mapDbProperty = """
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
"""

# Update mapPropertyToDb
new_mapPropertyToDb = """
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
"""

content = re.sub(r'  mapDbProperty\(id, data\) {.*?},\n', new_mapDbProperty, content, flags=re.DOTALL)
content = re.sub(r'  mapPropertyToDb\(p\) {.*?}\n', new_mapPropertyToDb, content, flags=re.DOTALL)

with open('js/firebase-config.js', 'w', encoding='utf-8') as f:
    f.write(content)
