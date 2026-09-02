import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

imgbb_html = """
          <div class="mt-4 border-t border-border-gray pt-4">
            <label class="block text-xs font-bold text-on-surface mb-1">مفتاح رفع الصور (ImgBB API Key)</label>
            <input id="imgbb-key-input" type="text" placeholder="مثال: 9b2d..." class="input-field w-full p-3 rounded-xl text-xs font-mono"/>
            <p class="text-[10px] text-secondary mt-1">احصل عليه مجاناً من <a href="https://api.imgbb.com/" target="_blank" class="text-primary hover:underline">api.imgbb.com</a></p>
          </div>
"""

content = content.replace('          <button id="firebase-save-btn"', imgbb_html + '\n          <button id="firebase-save-btn"')

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
