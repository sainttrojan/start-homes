import re

with open('js/admin.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the saveBtn listener
new_save = r"""    const imgbbInput = document.getElementById('imgbb-key-input');
    
    if (configInput) {
      const cfg = FirebaseConfig.getConfig();
      if(cfg) {
        configInput.value = JSON.stringify({
          apiKey: cfg.apiKey,
          authDomain: cfg.authDomain,
          projectId: cfg.projectId
        }, null, 2);
        if (imgbbInput && cfg.imgbbKey) imgbbInput.value = cfg.imgbbKey;
      }
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        try {
          FirebaseConfig.saveConfig(configInput.value, imgbbInput ? imgbbInput.value.trim() : '');
          FirebaseConfig.initApp();
          this.checkConnectionStatus();
          await this.refreshData();
          showToast('تم حفظ إعدادات Firebase و ImgBB بنجاح!', 'success');
        } catch(e) {
          showToast(e.message, 'error');
        }
      });
    }"""

content = re.sub(r'    if \(configInput\) \{.*?      \}\);\n    \}', lambda m: new_save, content, flags=re.DOTALL)

with open('js/admin.js', 'w', encoding='utf-8') as f:
    f.write(content)
