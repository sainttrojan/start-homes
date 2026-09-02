import re

with open('js/property-details.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace header populating
header = """
    if (propTitleEl) propTitleEl.textContent = prop.address || prop.title || 'تفاصيل الوحدة';
    if (propLocationEl) propLocationEl.textContent = prop.city || prop.address || 'القاهرة';
    if (propPriceEl) propPriceEl.textContent = formatEGP(prop.totalPrice || prop.price || 0);
"""

content = re.sub(r'    if \(propTitleEl\).*?if \(propPriceEl\).*?;', header, content, flags=re.DOTALL)

# Add financials population
financials = """
    // Financials
    const elTotal = document.getElementById('spec-total-price');
    const elPaid = document.getElementById('spec-paid');
    const elOver = document.getElementById('spec-over');
    const elRemain = document.getElementById('spec-remaining');
    const elDeposit = document.getElementById('spec-deposit');
    const elAnnual = document.getElementById('spec-annual-inst');
    const elMonthly = document.getElementById('spec-monthly-inst');

    if (elTotal) elTotal.textContent = formatEGP(prop.totalPrice || 0);
    if (elPaid) elPaid.textContent = formatEGP(prop.paidAmount || 0);
    if (elOver) elOver.textContent = formatEGP(prop.overPrice || 0);
    if (elRemain) elRemain.textContent = formatEGP(prop.remainingAmount || 0);
    if (elDeposit) elDeposit.textContent = formatEGP(prop.deposit || 0);
    if (elAnnual) elAnnual.textContent = formatEGP(prop.annualInstallment || 0);
    if (elMonthly) elMonthly.textContent = formatEGP(prop.monthlyInstallment || 0);
"""

content = content.replace("    // Description", financials + "\n    // Description")

with open('js/property-details.js', 'w', encoding='utf-8') as f:
    f.write(content)
