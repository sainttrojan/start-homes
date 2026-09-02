import re

with open('property-details.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's find the specs grid and append a financials grid after it
financials_html = """            <!-- Financials Grid -->
            <h3 class="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">payments</span>
              <span>التفاصيل المالية (الأسعار)</span>
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div class="bg-surface-container-low p-4 rounded-2xl border border-border-gray">
                <div class="text-xs text-secondary font-bold mb-1">إجمالي العقد</div>
                <div id="spec-total-price" class="font-bold text-on-surface text-base">---</div>
              </div>
              <div class="bg-surface-container-low p-4 rounded-2xl border border-border-gray">
                <div class="text-xs text-secondary font-bold mb-1">المدفوع</div>
                <div id="spec-paid" class="font-bold text-on-surface text-sm">---</div>
              </div>
              <div class="bg-badge-gold/10 p-4 rounded-2xl border border-badge-gold/30">
                <div class="text-xs text-badge-gold-text font-bold mb-1">الأوفر</div>
                <div id="spec-over" class="font-bold text-badge-gold-text text-sm">---</div>
              </div>
              <div class="bg-surface-container-low p-4 rounded-2xl border border-border-gray">
                <div class="text-xs text-secondary font-bold mb-1">المتبقي</div>
                <div id="spec-remaining" class="font-bold text-on-surface text-sm">---</div>
              </div>
              <div class="bg-surface-container-low p-4 rounded-2xl border border-border-gray">
                <div class="text-xs text-secondary font-bold mb-1">الوديعة</div>
                <div id="spec-deposit" class="font-bold text-on-surface text-sm">---</div>
              </div>
              <div class="bg-surface-container-low p-4 rounded-2xl border border-border-gray">
                <div class="text-xs text-secondary font-bold mb-1">قسط سنوي</div>
                <div id="spec-annual-inst" class="font-bold text-on-surface text-sm">---</div>
              </div>
              <div class="bg-surface-container-low p-4 rounded-2xl border border-border-gray">
                <div class="text-xs text-secondary font-bold mb-1">قسط شهري</div>
                <div id="spec-monthly-inst" class="font-bold text-on-surface text-sm">---</div>
              </div>
            </div>"""

pattern = re.compile(r'(<h3 class="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">.*?<span class="material-symbols-outlined text-primary">description</span>.*?</h3>.*?</div>)', re.DOTALL)
content = re.sub(pattern, financials_html + r'\n\n            \1', content)

with open('property-details.html', 'w', encoding='utf-8') as f:
    f.write(content)
