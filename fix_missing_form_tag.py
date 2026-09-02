with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

settings_btn = """        <button type="button" onclick="document.getElementById('admin-login-modal').classList.add('hidden'); document.getElementById('panel-settings').classList.remove('hidden');" class="w-full btn-secondary mt-3 py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-base">settings</span>
          <span>تحديث إعدادات Firebase</span>
        </button>"""

if settings_btn + '\n\n      </div>' in content:
    content = content.replace(settings_btn + '\n\n      </div>', settings_btn + '\n      </form>\n      </div>')

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
