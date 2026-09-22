import json
from collections import defaultdict
from datetime import datetime

# Load files
with open('src/data/designer_logs.json') as f:
    designer_logs = json.load(f)
with open('src/data/employees.json') as f:
    employees = json.load(f)
with open('src/data/hr_events.json') as f:
    hr_events = json.load(f)
with open('src/data/materials_inventory.json') as f:
    materials = json.load(f)
with open('src/data/finances.json') as f:
    finances = json.load(f)

# Real timber unit costs from finances.json:
# 8 m³ Walnut = $20,000 -> $2,500 / m³
# 10 m³ Oak = $12,000 -> $1,200 / m³
# 8 m³ Ash = $11,200 -> $1,400 / m³
REAL_TIMBER_COST = {
    'American Walnut': 2500,
    'Tasmanian Oak': 1200,
    'Victorian Ash': 1400
}

# Verify timber reorder sums
reorders_spent = defaultdict(float)
reorders_qty = defaultdict(float)
reorder_counts = defaultdict(int)
for fin in finances:
    desc = fin['description']
    amt = float(fin['amount'])
    if 'Reordered' in desc:
        if 'Walnut' in desc:
            reorders_spent['American Walnut'] += amt
            reorders_qty['American Walnut'] += 8.0
            reorder_counts['American Walnut'] += 1
        elif 'Oak' in desc:
            reorders_spent['Tasmanian Oak'] += amt
            reorders_qty['Tasmanian Oak'] += 10.0
            reorder_counts['Tasmanian Oak'] += 1
        elif 'Ash' in desc:
            reorders_spent['Victorian Ash'] += amt
            reorders_qty['Victorian Ash'] += 8.0
            reorder_counts['Victorian Ash'] += 1

print("Verified Timber from Finances Ledger:")
for t in ['American Walnut', 'Tasmanian Oak', 'Victorian Ash']:
    print(f"  {t}: reordered={reorders_qty[t]} m³, spent=${reorders_spent[t]:,.2f}, unitCost=${REAL_TIMBER_COST[t]}/m³, reorders={reorder_counts[t]}")

total_timber_spend = sum(reorders_spent.values())
print(f"  Total Timber Spend: ${total_timber_spend:,.2f}")
