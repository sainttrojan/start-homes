import re

with open('js/firebase-config.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Update getConfig
new_getConfig = r"""  getConfig() {
    try {
      const cfg = localStorage.getItem(this.KEY_CONFIG);
      const parsed = cfg ? JSON.parse(cfg) : null;
      return parsed;
    } catch(e) { return null; }
  },

  getImgbbKey() {
    const cfg = this.getConfig();
    return cfg ? cfg.imgbbKey : null;
  },"""
content = re.sub(r'  getConfig\(\) \{.*?\},\n', lambda m: new_getConfig + '\n', content, flags=re.DOTALL)

# Update saveConfig
new_saveConfig = r"""  saveConfig(configStr, imgbbKey = '') {
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
  },"""
content = re.sub(r'  saveConfig\(configStr\) \{.*?\},\n', lambda m: new_saveConfig + '\n', content, flags=re.DOTALL)

# Update uploadImages
new_uploadImages = r"""  async uploadImages(files) {
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
  },"""
content = re.sub(r'  async uploadImages\(files\) \{.*?  \},\n', lambda m: new_uploadImages + '\n', content, flags=re.DOTALL)

# Remove the storage getter
content = re.sub(r'  get storage\(\) \{.*?  \},\n', '', content, flags=re.DOTALL)

with open('js/firebase-config.js', 'w', encoding='utf-8') as f:
    f.write(content)
