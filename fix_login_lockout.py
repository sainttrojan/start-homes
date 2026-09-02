import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add a Settings button to the login modal
settings_btn = """
        <button type="button" onclick="document.getElementById('admin-login-modal').classList.add('hidden'); document.getElementById('panel-settings').classList.remove('hidden');" class="w-full btn-secondary mt-3 py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-base">settings</span>
          <span>تحديث إعدادات Firebase</span>
        </button>
"""

content = content.replace('          <span>دخول لوحة التحكم</span>\n        </button>', '          <span>دخول لوحة التحكم</span>\n        </button>' + settings_btn)

# Ensure panel-settings can be closed back to login if not authenticated
# In admin.js, we can just let them refresh the page after saving. The save button already does location.reload() or refreshData.

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
