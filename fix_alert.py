with open('js/admin.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'const submitBtn = document.getElementById(\'form-submit-btn\');' in line and 'submitBtn.addEventListener(\'click\'' in lines[i+1]:
        lines[i+2] = lines[i+2].replace('e.preventDefault();', 'e.preventDefault();\n      alert("تم الضغط على زر الحفظ وجاري المعالجة...");')
        break

with open('js/admin.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
