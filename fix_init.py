import re

with open('js/admin.js', 'r', encoding='utf-8') as f:
    content = f.read()

new_init = """  async init() {
    this.bindAuth();
    this.bindNavigation();
    this.bindSupabaseSettings();
    this.bindPropertyForm();

    AuthService.onAuthStateChanged(async (user) => {
      this.checkAuth();
      if (user) {
        await this.refreshData();
      }
    });

    this.checkConnectionStatus();
  },"""

content = re.sub(r'  async init\(\) \{.*?\},\n', new_init + "\n", content, flags=re.DOTALL)

with open('js/admin.js', 'w', encoding='utf-8') as f:
    f.write(content)
