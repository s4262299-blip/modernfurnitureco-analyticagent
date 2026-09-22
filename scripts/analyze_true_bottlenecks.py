import json
from collections import defaultdict
from datetime import datetime

with open('src/data/analyticsStore.json') as f:
    store = json.load(f)

orders = store['orders']

print("=== LATE ORDERS ANALYSIS (Lead time > 14 days) ===")
late_orders = [o for o in orders if o['isLate']]
print(f"Total late orders: {len(late_orders)} / {len(orders)} ({len(late_orders)/len(orders)*100:.1f}%)")

by_q_late = defaultdict(list)
for o in orders:
    dt = datetime.strptime(o['startDate'], '%Y-%m-%d')
    q = f"Q{((dt.month-1)//3)+1} {dt.year}"
    by_q_late[q].append(o)

for q, q_list in sorted(by_q_late.items()):
    l = [o for o in q_list if o['isLate']]
    print(f"{q}: {len(l)} late / {len(q_list)} total ({len(l)/len(q_list)*100:.1f}%)")

print("\n=== LATE ORDERS BY PRODUCT TYPE ===")
by_prod = defaultdict(lambda: {'total': 0, 'late': 0, 'lead_times': []})
for o in orders:
    pt = o['productType']
    by_prod[pt]['total'] += 1
    if o['isLate']:
        by_prod[pt]['late'] += 1
    by_prod[pt]['lead_times'].append(o['leadTimeDays'])

for pt, stats in sorted(by_prod.items(), key=lambda x: x[1]['late']/x[1]['total'], reverse=True):
    print(f"  {pt}: {stats['late']}/{stats['total']} late ({stats['late']/stats['total']*100:.1f}%), avg lead time: {sum(stats['lead_times'])/len(stats['lead_times']):.1f}d, max: {max(stats['lead_times'])}d")

print("\n=== LATE ORDERS BY TIMBER TYPE ===")
by_timber = defaultdict(lambda: {'total': 0, 'late': 0, 'lead_times': []})
for o in orders:
    m = o['materialType']
    by_timber[m]['total'] += 1
    if o['isLate']:
        by_timber[m]['late'] += 1
    by_timber[m]['lead_times'].append(o['leadTimeDays'])

for m, stats in sorted(by_timber.items(), key=lambda x: x[1]['late']/x[1]['total'], reverse=True):
    print(f"  {m}: {stats['late']}/{stats['total']} late ({stats['late']/stats['total']*100:.1f}%), avg lead time: {sum(stats['lead_times'])/len(stats['lead_times']):.1f}d, max: {max(stats['lead_times'])}d")

print("\n=== STAGE DURATIONS & HOURS ===")
print(f"Avg Design Hours: {sum(o['designHours'] for o in orders)/len(orders):.1f}")
print(f"Avg Milling Hours: {sum(o['millingHours'] for o in orders)/len(orders):.1f}")
print(f"Avg Joinery Hours: {sum(o['joineryHours'] for o in orders)/len(orders):.1f}")
print(f"Avg Finishing Hours: {sum(o['finishingHours'] for o in orders)/len(orders):.1f}")

print("\n=== TIMBER STOCKOUT LOGS ===")
with open('src/data/materials_inventory.json') as f:
    mat_logs = json.load(f)

for row in mat_logs:
    if int(row['newLevel']) <= 2:
        print(f"  {row['date']} - {row['material']}: level={row['newLevel']}, type={row['type']}, qty={row['quantity']}, orderId={row.get('orderId')}")
