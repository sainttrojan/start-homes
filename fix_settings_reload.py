with open('js/admin.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'showToast(\'تم حفظ إعدادات Firebase و ImgBB بنجاح!\', \'success\');' in line:
        # replace the previous line
        lines[i-1] = '          window.location.reload();\n'

with open('js/admin.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
