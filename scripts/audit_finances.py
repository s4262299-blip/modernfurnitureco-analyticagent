import json
from collections import defaultdict
from datetime import datetime

with open('src/data/finances.json') as f:
    finances = json.load(f)

tot_rev = sum(float(f['amount']) for f in finances if f['type'] == 'REVENUE')
tot_cost = sum(float(f['amount']) for f in finances if f['type'] == 'COST')
net_cash = tot_rev - tot_cost

print(f"Finances ledger:")
print(f"  Total Revenue: ${tot_rev:,.2f}")
print(f"  Total Cost: ${tot_cost:,.2f}")
print(f"  Net Cash Flow: ${net_cash:,.2f}")

# Cost breakdown
costs_by_cat = defaultdict(float)
for f in finances:
    if f['type'] == 'COST':
        desc = f['description']
        amt = float(f['amount'])
        if 'Overhead' in desc:
            costs_by_cat['Overheads'] += amt
        elif 'Wages' in desc:
            costs_by_cat['Wages'] += amt
        elif 'Reordered' in desc:
            costs_by_cat['Timber'] += amt
        else:
            costs_by_cat['Other'] += amt

for cat, amt in costs_by_cat.items():
    print(f"  {cat}: ${amt:,.2f} ({amt/tot_cost*100:.1f}%)")

# Quarterly finances
q_fin = defaultdict(lambda: {'rev': 0.0, 'wages': 0.0, 'overheads': 0.0, 'timber': 0.0, 'cost': 0.0})
for f in finances:
    dt = datetime.strptime(f['date'], '%Y-%m-%d')
    q = f"Q{((dt.month-1)//3)+1} {dt.year}"
    amt = float(f['amount'])
    if f['type'] == 'REVENUE':
        q_fin[q]['rev'] += amt
    else:
        q_fin[q]['cost'] += amt
        if 'Wages' in f['description']:
            q_fin[q]['wages'] += amt
        elif 'Overhead' in f['description']:
            q_fin[q]['overheads'] += amt
        elif 'Reordered' in f['description']:
            q_fin[q]['timber'] += amt

print("\nQuarterly Breakdown from finances.json:")
for q, data in sorted(q_fin.items()):
    net = data['rev'] - data['cost']
    margin = (net / data['rev']) * 100 if data['rev'] else 0
    print(f"  {q}: Rev=${data['rev']:,.2f}, Cost=${data['cost']:,.2f}, Net=${net:,.2f}, Margin={margin:.1f}%, Wages=${data['wages']:,.2f}, Timber=${data['timber']:,.2f}, Overheads=${data['overheads']:,.2f}")
