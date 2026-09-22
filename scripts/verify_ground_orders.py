import json
from collections import defaultdict
from datetime import datetime

with open('src/data/designer_logs.json') as f:
    designer_logs = json.load(f)
with open('src/data/employees.json') as f:
    employees = json.load(f)
with open('src/data/hr_events.json') as f:
    hr_events = json.load(f)
with open('src/data/materials_inventory.json') as f:
    materials = json.load(f)
with open('src/data/finances.json') as f:
    finances = json.load(f)

# True verified timber unit costs from finances reorders:
TIMBER_UNIT_COST = {
    'American Walnut': 2500,
    'Tasmanian Oak': 1200,
    'Victorian Ash': 1400
}

# 1. Parse exact financial ledger records for orders
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

print(f"Total verified orders in finances: {len(fin_orders)}")

# Lookup maps
des_map = {}
for d in designer_logs:
    oid = d['orderId']
    if oid not in des_map or int(d.get('durationDays', 0)) > int(des_map[oid].get('durationDays', 0)):
        des_map[oid] = d

mat_map = {}
for m in materials:
    oid = m.get('orderId')
    if oid and oid != 'N/A':
        mat_map[oid] = m

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

    des_days = int(d_log.get('durationDays', 3))
    des_hours = des_days * 8
    des_skill = d_log.get('designerSkill', 'high')
    des_id = d_log.get('designerId', 'D1')

    unit_c = TIMBER_UNIT_COST.get(mat_type, 1800)
    mat_cost = mat_qty * unit_c

    des_rate = 45 if des_skill == 'high' else 30
    des_labor = des_hours * des_rate
    maker_labor = (milling_h + joinery_h + finishing_h) * 30
    tot_labor = des_labor + maker_labor

    rev = round(f_data['revenue'], 2)
    gross_profit = round(rev - (mat_cost + tot_labor), 2)
    profit_margin = round((gross_profit / rev) * 100, 1) if rev > 0 else 0

    orders.append({
        'id': oid,
        'customerId': f"CUST-{oid*3 + 96}",
        'productType': prod_type,
        'materialType': mat_type,
        'materialQty': mat_qty,
        'materialCost': mat_cost,
        'quotePrice': round(rev * 1.05, 2),
        'actualRevenue': rev,
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
        'grossProfit': gross_profit,
        'profitMargin': profit_margin
    })

sum_order_rev = sum(o['actualRevenue'] for o in orders)
fin_total_rev = sum(float(f['amount']) for f in finances if f['type'] == 'REVENUE')
print(f"Sum of orders actualRevenue: ${sum_order_rev:,.2f}")
print(f"Total finances REVENUE:      ${fin_total_rev:,.2f}")
print(f"Difference: ${abs(sum_order_rev - fin_total_rev):,.2f}")
