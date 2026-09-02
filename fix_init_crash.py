with open('js/firebase-config.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('FirebaseConfig.initApp();', 'try { FirebaseConfig.initApp(); } catch(e) { console.error("Firebase init failed:", e); }')

with open('js/firebase-config.js', 'w', encoding='utf-8') as f:
    f.write(content)
