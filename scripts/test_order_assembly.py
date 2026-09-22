import json
from collections import defaultdict
from datetime import datetime

with open('src/data/designer_logs.json') as f:
    designer_logs = json.load(f)
with open('src/data/materials_inventory.json') as f:
    materials = json.load(f)
with open('src/data/finances.json') as f:
    finances = json.load(f)
with open('src/data/employees.json') as f:
    employees = json.load(f)
with open('src/data/hr_events.json') as f:
    hr_events = json.load(f)

# True verified timber unit costs from finances reorders:
TIMBER_UNIT_COST = {
    'American Walnut': 2500,
    'Tasmanian Oak': 1200,
    'Victorian Ash': 1400
}

# 160 Orders from finances.json
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

des_map = {d['orderId']: d for d in designer_logs}
mat_map = {m['orderId']: m for m in materials if m.get('orderId') and m['orderId'] != 'N/A'}

PRODUCT_MAP = {
    1.0: [('Coffee Table', 8, 12, 6), ('Side Table', 6, 10, 4), ('Lounge Chair', 8, 14, 6)],
    2.0: [('Dining Table', 10, 18, 8), ('Executive Desk', 10, 16, 8), ('Credenza', 10, 18, 8)],
    3.0: [('Bookshelf', 12, 22, 10), ('Modular Wall Unit', 14, 24, 10), ('Large Dining Table', 12, 22, 10)]
}

orders = []
for oid_str in sorted(fin_orders.keys(), key=lambda x: int(x)):
    oid = int(oid_str)
    f_data = fin_orders[oid_str]
    d_log = des_map.get(oid_str, {})
    m_log = mat_map.get(oid_str, {})

    start_date = f_data['deposits'][0] if f_data['deposits'] else d_log.get('startDate', '2025-01-02')
    comp_date = f_data['finals'][0] if f_data['finals'] else None
    
    if comp_date:
        d1 = datetime.strptime(start_date, '%Y-%m-%d')
        d2 = datetime.strptime(comp_date, '%Y-%m-%d')
        lead_time = max(1, (d2 - d1).days)
        status = 'DELIVERED'
    else:
        lead_time = 14
        status = 'IN_PRODUCTION'

    mat_type = m_log.get('material', 'American Walnut')
    mat_qty = float(m_log.get('quantity', 2.0))
    
    candidates = PRODUCT_MAP.get(mat_qty, [('Dining Table', 10, 18, 8)])
    prod_info = candidates[oid % len(candidates)]
    prod_type = prod_info[0]
    milling_h = prod_info[1]
    joinery_h = prod_info[2]
    finishing_h = prod_info[3]

    des_days = int(d_log.get('durationDays', 2))
    des_hours = des_days * 8
    des_skill = d_log.get('designerSkill', 'high')
    des_id = d_log.get('designerId', 'D1')
    
    unit_c = TIMBER_UNIT_COST.get(mat_type, 1800)
    mat_cost = mat_qty * unit_c

    des_rate = 45 if des_skill == 'high' else 30
    des_labor = des_hours * des_rate
    maker_labor = (milling_h + joinery_h + finishing_h) * 30
    tot_labor = des_labor + maker_labor

    rev = f_data['revenue']
    if rev == 0:
        rev = (mat_cost + tot_labor) * 2.1

    gross_profit = rev - (mat_cost + tot_labor)
    profit_margin = round((gross_profit / rev) * 100, 1) if rev > 0 else 0

    orders.append({
        'id': oid,
        'customerId': f"CUST-{oid*3 + 96}",
        'productType': prod_type,
        'materialType': mat_type,
        'materialQty': mat_qty,
        'materialCost': mat_cost,
        'quotePrice': round(rev * 1.05, 2),
        'actualRevenue': round(rev, 2),
        'status': status,
        'startDate': start_date,
        'completionDate': comp_date,
        'leadTimeDays': lead_time,
        'isLate': lead_time > 14,
        'lateDays': max(0, lead_time - 14),
        'designerId': des_id,
        'designerSkill': des_skill,
        'designHours': des_hours,
        'millingHours': milling_h,
        'joineryHours': joinery_h,
        'finishingHours': finishing_h,
        'totalLaborHours': des_hours + milling_h + joinery_h + finishing_h,
        'estimatedLaborCost': tot_labor,
        'grossProfit': round(gross_profit, 2),
        'profitMargin': profit_margin
    })

print(f"Total orders: {len(orders)}")
delivered = sum(1 for o in orders if o['status'] == 'DELIVERED')
in_prod = sum(1 for o in orders if o['status'] == 'IN_PRODUCTION')
print(f"Delivered: {delivered}, In Production: {in_prod}")

lead_times = [o['leadTimeDays'] for o in orders]
print(f"Lead time: min={min(lead_times)}, max={max(lead_times)}, avg={sum(lead_times)/len(lead_times):.2f}")
late_orders = sum(1 for o in orders if o['isLate'])
print(f"Late orders: {late_orders} / {len(orders)} ({late_orders/len(orders)*100:.1f}%)")

# Quarterly check
q_stats = defaultdict(list)
for o in orders:
    dt = datetime.strptime(o['startDate'], '%Y-%m-%d')
    q = f"Q{((dt.month-1)//3)+1} {dt.year}"
    q_stats[q].append(o)

print("\nQuarterly Breakdown (by Order startDate):")
for q in sorted(q_stats.keys()):
    q_orders = q_stats[q]
    q_lts = [o['leadTimeDays'] for o in q_orders]
    q_late = sum(1 for o in q_orders if o['isLate'])
    q_des_h = [o['designHours'] for o in q_orders]
    q_rev = sum(o['actualRevenue'] for o in q_orders)
    print(f"  {q}: orders={len(q_orders)}, avg_lead={sum(q_lts)/len(q_lts):.2f}d, min={min(q_lts)}d, max={max(q_lts)}d, late={q_late} ({q_late/len(q_orders)*100:.1f}%), avg_des_h={sum(q_des_h)/len(q_des_h):.1f}h, rev=${q_rev:,.2f}")
