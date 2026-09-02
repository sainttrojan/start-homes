with open('js/admin.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the specific listener with event delegation on the document
old_listener = """  bindPropertyForm() {
    const form = document.getElementById('property-form');
    if (!form) return;

    const submitBtn = document.getElementById('form-submit-btn');
    if(submitBtn) submitBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      alert("تم الضغط على زر الحفظ وجاري المعالجة...");

      const submitBtn = document.getElementById('form-submit-btn');
      const spinner = document.getElementById('submit-spinner');"""

new_listener = """  bindPropertyForm() {
    document.addEventListener('click', async (e) => {
      const btn = e.target.closest('#form-submit-btn');
      if (!btn) return;
      
      e.preventDefault();
      const submitBtn = btn;
      const spinner = document.getElementById('submit-spinner');"""

if old_listener in content:
    content = content.replace(old_listener, new_listener)

with open('js/admin.js', 'w', encoding='utf-8') as f:
    f.write(content)
