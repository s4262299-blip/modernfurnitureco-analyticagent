import json
from collections import defaultdict
from datetime import datetime

with open('src/data/finances.json') as f:
    fin = json.load(f)
with open('src/data/analyticsStore.json') as f:
    store = json.load(f)
orders = store['orders']

q_fin = defaultdict(lambda: {'rev': 0.0, 'cost': 0.0, 'wages': 0.0, 'timber': 0.0, 'overheads': 0.0})
for x in fin:
    dt = datetime.strptime(x['date'], '%Y-%m-%d')
    q = f"Q{((dt.month-1)//3)+1} {dt.year}"
    amt = float(x['amount'])
    desc = x.get('description', '')
    if x['type'] == 'REVENUE':
        q_fin[q]['rev'] += amt
    else:
        q_fin[q]['cost'] += amt
        if 'Wages' in desc:
            q_fin[q]['wages'] += amt
        elif 'Overhead' in desc:
            q_fin[q]['overheads'] += amt
        elif 'Reordered' in desc:
            q_fin[q]['timber'] += amt

for q in sorted(q_fin.keys()):
    r = q_fin[q]['rev']
    c = q_fin[q]['cost']
    n = r - c
    m = (n / r) * 100 if r > 0 else 0
    print(f"{q}: Rev=${r:,.2f}, Cost=${c:,.2f}, Net=${n:,.2f}, NetMargin={m:.2f}%")

# Compare Q2 vs Q1 revenue growth
rev_q1 = q_fin['Q1 2025']['rev']
rev_q2 = q_fin['Q2 2025']['rev']
rev_q3 = q_fin['Q3 2025']['rev']
print(f"Q1 to Q2 Rev Change: {((rev_q2 - rev_q1) / rev_q1)*100:.2f}%")
print(f"Q2 to Q3 Rev Change: {((rev_q3 - rev_q2) / rev_q2)*100:.2f}%")

# Quarterly orders initiated and late rate
q_orders = defaultdict(list)
for o in orders:
    dt = datetime.strptime(o['startDate'], '%Y-%m-%d')
    q = f"Q{((dt.month-1)//3)+1} {dt.year}"
    q_orders[q].append(o)

for q in sorted(q_orders.keys()):
    os = q_orders[q]
    cnt = len(os)
    lts = [o['leadTimeDays'] for o in os]
    late = sum(1 for o in os if o['isLate'])
    print(f"{q}: Orders={cnt}, AvgLeadTime={sum(lts)/cnt:.2f}d, Late={late} ({(late/cnt)*100:.2f}%), OnTime={cnt-late} ({((cnt-late)/cnt)*100:.2f}%)")
