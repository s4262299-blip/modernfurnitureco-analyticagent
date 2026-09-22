import json
from datetime import datetime
from collections import defaultdict, Counter

with open('src/data/materials_inventory.json') as f:
    materials = json.load(f)

with open('src/data/hr_events.json') as f:
    hr_events = json.load(f)

with open('src/data/designer_logs.json') as f:
    designers = json.load(f)

with open('src/data/finances.json') as f:
    finances = json.load(f)

with open('src/data/employees.json') as f:
    employees = json.load(f)

print("=== 1. HR EVENTS & RESIGNATIONS ===")
resignations = [e for e in hr_events if e['event'] == 'Resignation']
print(f"Total resignations: {len(resignations)}")
for r in resignations:
    print(f"  {r['date']}: {r['employeeId']} ({r['details']})")

leaves = [e for e in hr_events if 'Leave' in e['event']]
print(f"Total leave events: {len(leaves)}")

print("\n=== 2. MATERIAL STOCK LEVELS & STOCKOUTS ===")
stockouts = [m for m in materials if int(m['newLevel']) <= 2]
print(f"Low stock events (<= 2 m³): {len(stockouts)}")
for s in stockouts[:10]:
    print(f"  {s['date']}: {s['material']} level={s['newLevel']} type={s['type']} qty={s['quantity']}")

print("\n=== 3. DESIGNER LOGS & DURATION ===")
durations = [int(d['durationDays']) for d in designers if d.get('durationDays') and int(d.get('durationDays')) > 0]
if durations:
    print(f"Avg design duration: {sum(durations)/len(durations):.2f} days, Max: {max(durations)} days")

# Orders with unfinished design (durationDays == 0 or endDate missing)
unfinished_des = [d for d in designers if not d.get('endDate') or int(d.get('durationDays', 0)) == 0]
print(f"Unfinished / pending design orders: {len(unfinished_des)}")

print("\n=== 4. FINANCIAL SUMMARY ===")
costs = sum(float(f['amount']) for f in finances if f['type'] == 'COST')
revs = sum(float(f['amount']) for f in finances if f['type'] == 'REVENUE')
print(f"Total Costs: ${costs:,.2f}")
print(f"Total Revenues: ${revs:,.2f}")
print(f"Net Cash Flow: ${revs - costs:,.2f}")
