import re
import time

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Change button type="submit" to type="button"
content = content.replace('id="form-submit-btn" type="submit"', 'id="form-submit-btn" type="button"')
# Change form tag to not be a form, just a div, to absolutely prevent native submission
content = content.replace('<form id="property-form"', '<div id="property-form"')
content = content.replace('</form>', '</div>')

# Update cache buster
ts = str(int(time.time()))
content = re.sub(r'js/admin.js\?v=\d+', f'js/admin.js?v={ts}', content)
content = re.sub(r'js/firebase-config.js\?v=\d+', f'js/firebase-config.js?v={ts}', content)

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)

with open('js/admin.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

# Change event listener from form 'submit' to button 'click'
js_content = js_content.replace("form.addEventListener('submit', async (e) => {", "const submitBtn = document.getElementById('form-submit-btn');\n    if(submitBtn) submitBtn.addEventListener('click', async (e) => {")

with open('js/admin.js', 'w', encoding='utf-8') as f:
    f.write(js_content)
