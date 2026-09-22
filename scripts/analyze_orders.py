import json

with open('src/data/materials_inventory.json') as f:
    materials = json.load(f)

with open('src/data/designer_logs.json') as f:
    designers = json.load(f)

with open('src/data/finances.json') as f:
    finances = json.load(f)

consume_rows = [m for m in materials if m.get('type') == 'CONSUME']
print(f"Total CONSUME rows: {len(consume_rows)}")
print("Sample consume row:", consume_rows[0])

# Let's map orders from finances
orders_fin = {}
for fin in finances:
    desc = fin.get('description', '')
    if '#' in desc:
        order_num = desc.split('#')[1].strip()
        if order_num not in orders_fin:
            orders_fin[order_num] = {'deposits': [], 'finals': []}
        if 'Deposit' in desc:
            orders_fin[order_num]['deposits'].append(fin)
        elif 'Final payment' in desc:
            orders_fin[order_num]['finals'].append(fin)

print(f"Total orders in finances: {len(orders_fin)}")
sample_order = list(orders_fin.keys())[0]
print(f"Order #{sample_order}:", orders_fin[sample_order])

# Check product types in the dataset
# What product types exist? In ModernFurniture co:
# Usually: Dining Table, Desk, Coffee Table, Bookshelf, Chair / Armchair, Credenza / Sideboard, Bed Frame
