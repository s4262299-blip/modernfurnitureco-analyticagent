import json
from collections import defaultdict
from datetime import datetime

with open('src/data/designer_logs.json') as f:
    designer_logs = json.load(f)
with open('src/data/materials_inventory.json') as f:
    materials = json.load(f)
with open('src/data/finances.json') as f:
    finances = json.load(f)

# Extract the 160 orders from finances.json
fin_orders = defaultdict(lambda: {'deposits': [], 'finals': [], 'revenue': 0.0})
for fin in finances:
    desc = fin.get('description', '')
    if '#' in desc:
        oid_str = desc.split('#')[1].strip()
        amt = float(fin['amount'])
        fin_orders[oid_str]['revenue'] += amt
        if 'Deposit' in desc:
            fin_orders[oid_str]['deposits'].append(fin['date'])
        elif 'Final payment' in desc:
            fin_orders[oid_str]['finals'].append(fin['date'])

print(f"Total orders with finance entries: {len(fin_orders)}")

# Check overlap with designer logs and materials
des_map = {d['orderId']: d for d in designer_logs}
mat_map = {m['orderId']: m for m in materials if m.get('orderId') and m['orderId'] != 'N/A'}

orders = []
for oid_str, fin_data in fin_orders.items():
    d_log = des_map.get(oid_str, {})
    m_log = mat_map.get(oid_str, {})
    
    start_date = fin_data['deposits'][0] if fin_data['deposits'] else d_log.get('startDate', '2025-01-02')
    comp_date = fin_data['finals'][0] if fin_data['finals'] else d_log.get('endDate')
    
    d1 = datetime.strptime(start_date, '%Y-%m-%d')
    if comp_date:
        d2 = datetime.strptime(comp_date, '%Y-%m-%d')
        lead_days = (d2 - d1).days
        lead_days = max(1, lead_days)
        status = 'DELIVERED'
    else:
        lead_days = 14
        status = 'IN_PRODUCTION'
        
    orders.append({
        'oid': oid_str,
        'start': start_date,
        'comp': comp_date,
        'lead_days': lead_days,
        'status': status,
        'rev': fin_data['revenue']
    })

lts = [o['lead_days'] for o in orders]
print(f"Orders count: {len(orders)}, min lead: {min(lts)}, max lead: {max(lts)}, avg lead: {sum(lts)/len(lts):.2f}")
