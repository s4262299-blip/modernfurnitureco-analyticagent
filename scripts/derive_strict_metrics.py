import json
from collections import defaultdict
from datetime import datetime

with open('src/data/finances.json') as f:
    fin = json.load(f)
with open('src/data/materials_inventory.json') as f:
    mat = json.load(f)
with open('src/data/designer_logs.json') as f:
    des = json.load(f)
with open('src/data/employees.json') as f:
    emp = json.load(f)
with open('src/data/hr_events.json') as f:
    hr = json.load(f)
with open('src/data/analyticsStore.json') as f:
    store = json.load(f)

orders = store['orders']

print("=== QUARTERLY FINANCIAL METRICS DERIVATION ===")
quarter_fin = defaultdict(lambda: {'rev': 0.0, 'wages': 0.0, 'overheads': 0.0, 'timber': 0.0, 'costs': 0.0, 'dep_cnt': 0, 'final_cnt': 0})
for x in fin:
    dt = datetime.strptime(x['date'], '%Y-%m-%d')
    q = f"Q{((dt.month-1)//3)+1} {dt.year}"
    amt = float(x['amount'])
    desc = x.get('description', '')
    if x['type'] == 'REVENUE':
        quarter_fin[q]['rev'] += amt
        if 'Deposit' in desc:
            quarter_fin[q]['dep_cnt'] += 1
        elif 'Final payment' in desc:
            quarter_fin[q]['final_cnt'] += 1
    else:
        quarter_fin[q]['costs'] += amt
        if 'Wages' in desc:
            quarter_fin[q]['wages'] += amt
        elif 'Overhead' in desc:
            quarter_fin[q]['overheads'] += amt
        elif 'Reordered' in desc:
            quarter_fin[q]['timber'] += amt

for q in sorted(quarter_fin.keys()):
    d = quarter_fin[q]
    rev = d['rev']
    costs = d['costs']
    w = d['wages']
    o = d['overheads']
    t = d['timber']
    net = rev - costs
    margin = (net / rev) * 100 if rev > 0 else 0
    print(f"Quarter: {q}")
    print(f"  Revenue: ${rev:,.2f}")
    print(f"  Costs: ${costs:,.2f} (Wages: ${w:,.2f}, Overheads: ${o:,.2f}, Timber: ${t:,.2f})")
    print(f"  Net: ${net:,.2f} ({margin:.2f}%)")
    print(f"  Deposit count: {d['dep_cnt']}, Final count: {d['final_cnt']}")

print("\n=== QUARTERLY ORDER LEAD TIME & DELAYS DERIVATION ===")
# Group orders by start date quarter
order_q = defaultdict(list)
for o in orders:
    dt = datetime.strptime(o['startDate'], '%Y-%m-%d')
    q = f"Q{((dt.month-1)//3)+1} {dt.year}"
    order_q[q].append(o)

for q in sorted(order_q.keys()):
    q_orders = order_q[q]
    cnt = len(q_orders)
    lts = [o['leadTimeDays'] for o in q_orders]
    avg_lt = sum(lts) / cnt
    min_lt = min(lts)
    max_lt = max(lts)
    late_cnt = sum(1 for o in q_orders if o['isLate'])
    late_pct = (late_cnt / cnt) * 100
    ontime_cnt = cnt - late_cnt
    ontime_pct = (ontime_cnt / cnt) * 100
    print(f"Quarter: {q}")
    print(f"  Orders initiated: {cnt}")
    print(f"  Lead times: Avg={avg_lt:.2f}d, Min={min_lt}d, Max={max_lt}d")
    print(f"  Late orders (>14d): {late_cnt} ({late_pct:.1f}%)")
    print(f"  On-time orders: {ontime_cnt} ({ontime_pct:.1f}%)")

print("\n=== TIMBER SPECIES METRICS DERIVATION ===")
mat_2025 = [m for m in mat if m['date'] <= '2025-08-31']
for species in ['American Walnut', 'Tasmanian Oak', 'Victorian Ash']:
    s_logs = [m for m in mat_2025 if m.get('material') == species]
    consumed = sum(float(m['quantity']) for m in s_logs if m.get('type') == 'CONSUME')
    reorders = [m for m in s_logs if m.get('type') == 'REORDER']
    reordered = sum(float(m['quantity']) for m in reorders)
    reorder_events = len(reorders)
    zero_stock = [m['date'] for m in s_logs if int(m.get('newLevel', -1)) == 0]
    low_stock = [m['date'] for m in s_logs if 0 < int(m.get('newLevel', -1)) <= 2]
    print(f"Species: {species}")
    print(f"  Consumed: {consumed:.1f} m³")
    print(f"  Reordered: {reordered:.1f} m³ across {reorder_events} reorders")
    print(f"  Zero stock events (0 m³): {len(zero_stock)} {zero_stock}")
    print(f"  Low stock events (1-2 m³): {len(low_stock)} {low_stock}")

print("\n=== HR & STAFFING DERIVATION ===")
print(f"Total employees in database: {len(emp)}")
active_emp = [e for e in emp if e['status'] == 'Active']
resigned_emp = [e for e in emp if e['status'] == 'Resigned']
print(f"Active employees: {len(active_emp)}")
print(f"Resigned employees (all time): {len(resigned_emp)}")

# Resignations within 2025-01-01 to 2025-08-31
res_2025 = [h for h in hr if '2025-01-01' <= h['date'] <= '2025-08-31' and h.get('eventType') == 'Resignation']
print(f"Resignations between 2025-01-01 and 2025-08-31: {len(res_2025)}")
for r in res_2025:
    print(f"  {r['date']}: Employee {r['employeeId']}, Role: {r.get('role', 'N/A')}, Reason: {r.get('notes', '')}")

# July 2025 designer departures
jul_res = [r for r in res_2025 if r['date'].startswith('2025-07')]
print(f"July 2025 resignations: {len(jul_res)}")

print("\n=== PRODUCT LINE PROFITABILITY DERIVATION ===")
prods = store['productProfitability']
for p in prods:
    print(f"Product: {p['productType']}")
    print(f"  Orders: {p['orderCount']}")
    print(f"  Revenue: ${p['totalRevenue']:,.2f}")
    print(f"  Gross Profit: ${p['grossProfit']:,.2f}")
    print(f"  Margin: {p['profitMargin']:.1f}%")
    print(f"  Avg Lead Time: {p['avgLeadTime']}d, Late Rate: {p['lateRate']}%")
