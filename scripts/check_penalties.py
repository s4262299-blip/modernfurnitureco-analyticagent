import json

with open('src/data/finances.json') as f:
    finances = json.load(f)

orders_fin = {}
for fin in finances:
    desc = fin.get('description', '')
    if '#' in desc:
        oid = desc.split('#')[1].strip()
        if oid not in orders_fin:
            orders_fin[oid] = {}
        if 'Deposit' in desc:
            orders_fin[oid]['deposit'] = float(fin['amount'])
            orders_fin[oid]['deposit_date'] = fin['date']
            orders_fin[oid]['deposit_day'] = int(fin['day'])
        elif 'Final payment' in desc:
            orders_fin[oid]['final'] = float(fin['amount'])
            orders_fin[oid]['final_date'] = fin['date']
            orders_fin[oid]['final_day'] = int(fin['day'])

penalized_orders = []
normal_orders = []
in_progress_orders = []

for oid, data in orders_fin.items():
    if 'deposit' in data and 'final' in data:
        dep = data['deposit']
        fin = data['final']
        diff = fin - dep
        duration = data['final_day'] - data['deposit_day']
        data['duration_days'] = duration
        if diff < -1.0: # Final payment is discounted / penalized!
            penalized_orders.append((oid, dep, fin, diff, duration, data['deposit_date'], data['final_date']))
        else:
            normal_orders.append((oid, dep, fin, duration, data['deposit_date'], data['final_date']))
    elif 'deposit' in data:
        in_progress_orders.append((oid, data['deposit'], data['deposit_date']))

print(f"Total delivered orders in finances: {len(normal_orders) + len(penalized_orders)}")
print(f"Delivered on time / full payment: {len(normal_orders)}")
print(f"Delivered with late penalty/discount: {len(penalized_orders)}")
print(f"Still in progress / active: {len(in_progress_orders)}")

if penalized_orders:
    print("\nSample penalized orders:")
    for p in penalized_orders[:10]:
        print(f"  Order #{p[0]}: Deposit=${p[1]:.2f}, Final=${p[2]:.2f} (Penalty: ${-p[3]:.2f}), Took {p[4]} days ({p[5]} to {p[6]})")
else:
    print("All final payments equaled deposit amount.")
