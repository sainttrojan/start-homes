import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('id="form-submit-btn" type="button"', 'id="form-submit-btn" type="button" onclick="AdminApp.submitPropertyForm(this)"')

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)

with open('js/admin.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

# Replace bindPropertyForm with the new function
old_bind = """  bindPropertyForm() {
    document.addEventListener('click', async (e) => {
      const btn = e.target.closest('#form-submit-btn');
      if (!btn) return;
      
      e.preventDefault();
      const submitBtn = btn;
      const spinner = document.getElementById('submit-spinner');"""

new_bind = """  bindPropertyForm() {
    // Left empty since we now use inline onclick
  },

  async submitPropertyForm(submitBtn) {
      if (!submitBtn) return;
      
      const spinner = document.getElementById('submit-spinner');"""

# The rest of the function remains the same, except we need to close it properly.
# Actually, the old listener has `    });\n  },` at the end.
# We need to replace that with `  },`
# Let's just do a regex or string replacement.

js_content = js_content.replace(old_bind, new_bind)
js_content = js_content.replace("""          showToast(err.message || 'حدث خطأ أثناء الحفظ', 'error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (spinner) spinner.classList.add('hidden');
      }
    });
  },""", """          showToast(err.message || 'حدث خطأ أثناء الحفظ', 'error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (spinner) spinner.classList.add('hidden');
      }
  },""")

with open('js/admin.js', 'w', encoding='utf-8') as f:
    f.write(js_content)
