with open('js/admin.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('form.reset();', "const form = document.getElementById('property-form');\n        if (form && form.tagName === 'FORM') form.reset();")

with open('js/admin.js', 'w', encoding='utf-8') as f:
    f.write(content)
