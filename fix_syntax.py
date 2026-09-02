with open('js/admin.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '});' in line and i > 355 and i < 370:
        if '}' in lines[i-1] and '},' in lines[i+1]:
             lines[i] = ''
             break

with open('js/admin.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
