import json

with open('src/data/materials_inventory.json') as f:
    materials = json.load(f)

with open('src/data/designer_logs.json') as f:
    designers = json.load(f)

with open('src/data/finances.json') as f:
    finances = json.load(f)

mat_orders = {m['orderId']: m for m in materials if m.get('orderId') and m.get('orderId') != 'N/A'}
des_orders = {d['orderId']: d for d in designers}

fin_orders = {}
for fin in finances:
    desc = fin.get('description', '')
    if '#' in desc:
        oid = desc.split('#')[1].strip()
        if oid not in fin_orders:
            fin_orders[oid] = []
        fin_orders[oid].append(fin)

all_order_ids = sorted(list(set(list(mat_orders.keys()) + list(des_orders.keys()) + list(fin_orders.keys()))), key=lambda x: int(x) if x.isdigit() else 0)
print(f"Total unique order IDs: {len(all_order_ids)}")
print(f"Min order: {all_order_ids[0]}, Max order: {all_order_ids[-1]}")
print(f"Orders with materials: {len(mat_orders)}")
print(f"Orders with designer logs: {len(des_orders)}")
print(f"Orders with finances: {len(fin_orders)}")
