import json
from collections import defaultdict

with open('src/data/finances.json') as f:
    finances = json.load(f)

with open('src/data/materials_inventory.json') as f:
    materials = json.load(f)

with open('src/data/designer_logs.json') as f:
    designers = json.load(f)

orders_data = defaultdict(lambda: {'deposits': [], 'finals': [], 'materials': [], 'designer': None})

for fin in finances:
    desc = fin.get('description', '')
    if '#' in desc:
        oid = desc.split('#')[1].strip()
        if 'Deposit' in desc:
            orders_data[oid]['deposits'].append(float(fin['amount']))
        elif 'Final' in desc:
            orders_data[oid]['finals'].append(float(fin['amount']))

for m in materials:
    oid = m.get('orderId')
    if oid and oid != 'N/A':
        orders_data[oid]['materials'].append(m)

for d in designers:
    oid = str(d.get('orderId'))
    orders_data[oid]['designer'] = d

# Let's inspect unique (material, qty, quote) tuples
specs = defaultdict(list)
for oid, o in orders_data.items():
    if o['deposits'] and o['materials']:
        dep = round(o['deposits'][0], 2)
        total_price = round(dep * 2, 2)
        mat = o['materials'][0]['material']
        qty = o['materials'][0]['quantity']
        specs[(mat, qty, total_price)].append(oid)

print("Unique (material, qty, price) patterns:")
for k, v in sorted(specs.items(), key=lambda x: len(x[1]), reverse=True):
    print(f"Material: {k[0]}, Qty: {k[1]}, Total Price: ${k[2]} -> {len(v)} orders (e.g. {v[:3]})")
