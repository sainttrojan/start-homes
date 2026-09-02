with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('<div id="property-form" class="space-y-8">', '<form id="property-form" class="space-y-8" onsubmit="event.preventDefault();">')
content = content.replace('</div>\n      </div>\n\n      <!-- PANEL 3: Viewing Inquiries -->', '</form>\n      </div>\n\n      <!-- PANEL 3: Viewing Inquiries -->')

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)

with open('js/admin.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

# Make sure form.reset() is safe
js_content = js_content.replace('if (form) form.reset();', "if (form && form.tagName === 'FORM') form.reset();")

with open('js/admin.js', 'w', encoding='utf-8') as f:
    f.write(js_content)
