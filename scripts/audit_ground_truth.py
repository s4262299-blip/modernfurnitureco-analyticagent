import json
from collections import defaultdict
from datetime import datetime

with open('src/data/analyticsStore.json') as f:
    store = json.load(f)

orders = store['orders']
print('Total orders:', len(orders))

lead_times = [o['leadTimeDays'] for o in orders]
print(f'Overall Lead time: min={min(lead_times)}, max={max(lead_times)}, avg={sum(lead_times)/len(lead_times):.2f}')

# Lead time distribution
counts_by_lt = defaultdict(int)
for lt in lead_times:
    counts_by_lt[lt] += 1
print('Lead time distribution:')
for lt in sorted(counts_by_lt.keys()):
    print(f'  {lt} days: {counts_by_lt[lt]} orders')

# By quarter lead time & orders
q_orders = defaultdict(list)
for o in orders:
    dt = datetime.strptime(o['startDate'], '%Y-%m-%d')
    q = f"Q{((dt.month-1)//3)+1} {dt.year}"
    q_orders[q].append(o)

print('\nQuarterly metrics (by order startDate):')
for q in sorted(q_orders.keys()):
    lts = [o['leadTimeDays'] for o in q_orders[q]]
    design_hrs = [o['designHours'] for o in q_orders[q]]
    late = sum(1 for o in q_orders[q] if o['isLate'])
    rev = sum(o['actualRevenue'] for o in q_orders[q])
    gp = sum(o['grossProfit'] for o in q_orders[q])
    margin = (gp / rev) * 100 if rev else 0
    print(f"  {q}: orders={len(lts)}, avg_lead={sum(lts)/len(lts):.2f}d, min={min(lts)}d, max={max(lts)}d, avg_design_hrs={sum(design_hrs)/len(design_hrs):.2f}h, late={late} ({late/len(lts)*100:.1f}%), rev=${rev:,.2f}, margin={margin:.1f}%")

# Let's inspect designers and resignations
employees = store['employees']
print('\nEmployees count:', len(employees))
designers = [e for e in employees if 'designer' in e['role'].lower()]
makers = [e for e in employees if 'maker' in e['role'].lower()]
print(f"Designers: {len(designers)} total ({sum(1 for d in designers if d['status']=='Active')} active, {sum(1 for d in designers if d['status']=='Resigned')} resigned)")
print(f"Makers: {len(makers)} total ({sum(1 for m in makers if m['status']=='Active')} active, {sum(1 for m in makers if m['status']=='Resigned')} resigned)")

# HR events
hr_events = store['hrEvents']
resignations = [e for e in hr_events if e['event'] == 'Resignation']
print('\nResignations in order:')
for r in resignations:
    print(f"  {r['date']}: {r['employeeId']} - {r['details']}")

# Quarterly data from finances
print('\nFinances Quarterly Data:')
for q in store['quarterlyData']:
    print(f"  {q['quarter']}: Rev=${q['revenue']:,.2f}, Costs=${q['totalCosts']:,.2f}, NetProfit=${q['netProfit']:,.2f}, Margin={q['profitMargin']}%, OrdersCompleted={q['ordersCompleted']}")

# Monthly Data
print('\nMonthly Net Cash:')
for m in store['monthlyData']:
    print(f"  {m['month']}: Rev=${m['revenue']:,.2f}, Costs=${m['costs']:,.2f}, NetCash=${m['netCash']:,.2f}, Wages=${m['wages']:,.2f}, Timber=${m['timber']:,.2f}")
