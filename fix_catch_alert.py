with open('js/admin.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'showToast(err.message || \'حدث خطأ أثناء الحفظ\', \'error\');' in line:
        lines.insert(i+1, "          alert('خطأ: ' + (err.message || 'حدث خطأ أثناء الحفظ.'));\n")
        break

with open('js/admin.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
