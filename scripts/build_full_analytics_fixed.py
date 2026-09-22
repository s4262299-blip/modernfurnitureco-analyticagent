import csv
import json
from collections import defaultdict
from datetime import datetime

# --- Load real source data -------------------------------------------------
with open('src/data/csv/orders.csv') as f:
    orders_csv = list(csv.DictReader(f))

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

TIMBER_UNIT_COST = {
    'American Walnut': 2500,
    'Tasmanian Oak': 1200,
    'Victorian Ash': 1400
}

# Most recent designer assigned to each order, from the real design log
des_map = {}
for d in designer_logs:
    oid = str(d['orderId'])
    if oid not in des_map or int(d.get('durationDays', 0) or 0) >= int(des_map[oid].get('durationDays', 0) or 0):
        des_map[oid] = d

# --- 1. Build orders DIRECTLY from orders_data.csv (no fabricated categories) ---
orders = []
for row in orders_csv:
    oid = int(row['id'])
    d_log = des_map.get(str(oid), {})

    quote_price = float(row['quotePrice']) if row['quotePrice'] else 0.0
    material_cost = float(row['materialCost']) if row['materialCost'] else 0.0
    penalty_pct = float(row['penaltyPct']) if row['penaltyPct'] else 0.0
    late_days = int(float(row['lateDays'])) if row['lateDays'] else 0
    status = row['status']  # DESIGN / MILLING / JOINERY / FINISHING / DELIVERED / LOST

    design_h = float(row['designHours']) if row['designHours'] else 0.0
    milling_h = float(row['millingHours']) if row['millingHours'] else 0.0
    joinery_h = float(row['joineryHours']) if row['joineryHours'] else 0.0
    finishing_h = float(row['finishingHours']) if row['finishingHours'] else 0.0

    des_skill = d_log.get('designerSkill', 'high')
    des_id = d_log.get('designerId', None)
    des_rate = 45 if des_skill == 'high' else 30
    labor_cost = (design_h * des_rate) + ((milling_h + joinery_h + finishing_h) * 30)

    # Revenue is only realised for DELIVERED orders, net of any late penalty.
    # LOST and in-progress orders have not been paid.
    if status == 'DELIVERED':
        actual_revenue = round(quote_price * (1 - penalty_pct), 2)
    else:
        actual_revenue = 0.0

    gross_profit = round(actual_revenue - material_cost - labor_cost, 2) if status == 'DELIVERED' else None
    profit_margin = round((gross_profit / actual_revenue) * 100, 1) if (status == 'DELIVERED' and actual_revenue > 0) else None

    lead_time_days = None
    if row.get('acceptanceDate') and row.get('completionDate'):
        d1 = datetime.strptime(row['acceptanceDate'], '%Y-%m-%d')
        d2 = datetime.strptime(row['completionDate'], '%Y-%m-%d')
        lead_time_days = (d2 - d1).days

    orders.append({
        'id': oid,
        'customerId': row['customerId'],
        'productType': row['productType'],          # REAL value from the CSV, not invented
        'inquiryText': row['inquiryText'],
        'materialType': row['materialType'],
        'materialQty': float(row['materialQty']) if row['materialQty'] else 0.0,
        'materialCost': material_cost,
        'quotePrice': quote_price,
        'actualRevenue': actual_revenue,
        'status': status,
        'currentStage': row['currentStage'],
        'complexity': int(row['complexity']) if row['complexity'] else None,
        'creationDate': row['creationDate'],
        'acceptanceDate': row['acceptanceDate'] or None,
        'completionDate': row['completionDate'] or None,
        'dueDate': row['dueDate'] or None,
        'deliveryStatus': row['deliveryStatus'],
        'lateDays': late_days,
        'penaltyPct': penalty_pct,
        'isLate': row['deliveryStatus'] == 'Late',
        'leadTimeDays': lead_time_days,
        'designerId': des_id,
        'designerSkill': des_skill,
        'designHours': design_h,
        'millingHours': milling_h,
        'joineryHours': joinery_h,
        'finishingHours': finishing_h,
        'totalLaborHours': design_h + milling_h + joinery_h + finishing_h,
        'estimatedLaborCost': round(labor_cost, 2),
        'grossProfit': gross_profit,
        'profitMargin': profit_margin,
        'startDate': row['creationDate'],  # back-compat alias for older UI components
    })

# --- 2. Product profitability, based only on orders that actually delivered ---
# (plus win-rate, since conversion is a core focus area of this project)
prod_stats = defaultdict(lambda: {
    'totalInquiries': 0, 'won': 0, 'lost': 0,
    'revenue': 0.0, 'materialCost': 0.0, 'laborCost': 0.0, 'grossProfit': 0.0,
    'leadTimeSum': 0, 'leadTimeCount': 0, 'lateCount': 0, 'deliveredCount': 0
})

for o in orders:
    pt = o['productType']
    s = prod_stats[pt]
    s['totalInquiries'] += 1
    if o['status'] == 'DELIVERED':
        s['won'] += 1
        s['deliveredCount'] += 1
        s['revenue'] += o['actualRevenue']
        s['materialCost'] += o['materialCost']
        s['laborCost'] += o['estimatedLaborCost']
        s['grossProfit'] += o['grossProfit'] or 0
        if o['isLate']:
            s['lateCount'] += 1
        if o['leadTimeDays'] is not None:
            s['leadTimeSum'] += o['leadTimeDays']
            s['leadTimeCount'] += 1
    elif o['status'] == 'LOST':
        s['lost'] += 1

product_profitability = []
for pt, s in prod_stats.items():
    rev = round(s['revenue'], 2)
    mat = round(s['materialCost'], 2)
    lab = round(s['laborCost'], 2)
    prof = round(s['grossProfit'], 2)
    margin = round((prof / rev) * 100, 1) if rev > 0 else 0
    resolved = s['won'] + s['lost']  # excludes still-in-production
    win_rate = round((s['won'] / resolved) * 100, 1) if resolved > 0 else None
    product_profitability.append({
        'productType': pt,
        'totalInquiries': s['totalInquiries'],
        'deliveredOrderCount': s['deliveredCount'],
        'lostCount': s['lost'],
        'winRatePct': win_rate,
        'totalRevenue': rev,
        'materialCost': mat,
        'laborCost': lab,
        'grossProfit': prof,
        'profitMargin': margin,
        'avgLeadTime': round(s['leadTimeSum'] / s['leadTimeCount'], 1) if s['leadTimeCount'] else None,
        'lateRate': round((s['lateCount'] / s['deliveredCount']) * 100, 1) if s['deliveredCount'] else None
    })

product_profitability.sort(key=lambda x: x['grossProfit'], reverse=True)
# Back-compat alias for older UI components built against the previous schema
for p in product_profitability:
    p['orderCount'] = p['deliveredOrderCount']

# --- 3. Quarterly / monthly financial aggregation from the real ledger (unchanged logic — already grounded) ---
quarter_stats = defaultdict(lambda: {'revenue': 0.0, 'wages': 0.0, 'overheads': 0.0, 'timber': 0.0, 'ordersCompleted': 0})
for fin in finances:
    dt = datetime.strptime(fin['date'], '%Y-%m-%d')
    q_str = f"Q{((dt.month-1)//3)+1} {dt.year}"
    amt = float(fin['amount'])
    desc = fin['description']
    if fin['type'] == 'REVENUE':
        quarter_stats[q_str]['revenue'] += amt
        if 'Final payment' in desc:
            quarter_stats[q_str]['ordersCompleted'] += 1
    else:
        if 'Overheads' in desc:
            quarter_stats[q_str]['overheads'] += amt
        elif 'Wages' in desc:
            quarter_stats[q_str]['wages'] += amt
        elif 'Reordered' in desc:
            quarter_stats[q_str]['timber'] += amt

quarterly_data = []
for q_name, q in sorted(quarter_stats.items()):
    tot_cost = q['wages'] + q['overheads'] + q['timber']
    net_profit = q['revenue'] - tot_cost
    margin = round((net_profit / q['revenue']) * 100, 1) if q['revenue'] > 0 else 0
    quarterly_data.append({
        'quarter': q_name, 'revenue': round(q['revenue'], 2), 'wages': round(q['wages'], 2),
        'overheads': round(q['overheads'], 2), 'timberCost': round(q['timber'], 2),
        'totalCosts': round(tot_cost, 2), 'netProfit': round(net_profit, 2),
        'profitMargin': margin, 'ordersCompleted': q['ordersCompleted']
    })

monthly_stats = defaultdict(lambda: {'revenue': 0.0, 'costs': 0.0, 'timber': 0.0, 'wages': 0.0, 'overheads': 0.0})
for fin in finances:
    m_str = fin['date'][:7]
    amt = float(fin['amount'])
    desc = fin['description']
    if fin['type'] == 'REVENUE':
        monthly_stats[m_str]['revenue'] += amt
    else:
        monthly_stats[m_str]['costs'] += amt
        if 'Wages' in desc:
            monthly_stats[m_str]['wages'] += amt
        elif 'Overhead' in desc:
            monthly_stats[m_str]['overheads'] += amt
        elif 'Reorder' in desc:
            monthly_stats[m_str]['timber'] += amt

monthly_data = []
for m_name, m in sorted(monthly_stats.items()):
    monthly_data.append({
        'month': m_name, 'revenue': round(m['revenue'], 2), 'costs': round(m['costs'], 2),
        'wages': round(m['wages'], 2), 'overheads': round(m['overheads'], 2),
        'timber': round(m['timber'], 2), 'netCash': round(m['revenue'] - m['costs'], 2)
    })

# --- 4. Material stock analysis (unchanged logic — already grounded in real inventory log) ---
material_summary = []
mat_2025 = [m for m in materials if m['date'] <= '2025-08-31']
for mat in ['American Walnut', 'Tasmanian Oak', 'Victorian Ash']:
    mat_logs = [m for m in mat_2025 if m.get('material') == mat]
    consumed = sum(float(m['quantity']) for m in mat_logs if m.get('type') == 'CONSUME')
    reorders = [m for m in mat_logs if m.get('type') == 'REORDER']
    reorder_qty = sum(float(m['quantity']) for m in reorders)
    unit_c = TIMBER_UNIT_COST[mat]
    total_spent = reorder_qty * unit_c
    critical_events = [m for m in mat_logs if int(m['newLevel']) <= 2]
    material_summary.append({
        'material': mat, 'unitCost': unit_c, 'totalConsumedM3': round(consumed, 1),
        'totalReorderedM3': round(reorder_qty, 1), 'totalSpent': round(total_spent, 2),
        'reorderCount': len(reorders), 'criticalLowEvents': len(critical_events),
        'stockoutDates': [e['date'] for e in critical_events if int(e['newLevel']) == 0]
    })

# --- 5. Bottlenecks — computed from the real per-order data instead of hardcoded prose ---
# Average time-in-stage across DELIVERED orders, using the hours columns as a proxy for
# stage effort, plus late-delivery rate and staffing headcount per quarter.
def quarter_of(date_str):
    dt = datetime.strptime(date_str, '%Y-%m-%d')
    return f"Q{((dt.month-1)//3)+1} {dt.year}"

stage_hours = {'design': 0.0, 'milling': 0.0, 'joinery': 0.0, 'finishing': 0.0}
stage_counts = {'design': 0, 'milling': 0, 'joinery': 0, 'finishing': 0}
delivered_orders = [o for o in orders if o['status'] == 'DELIVERED']
for o in delivered_orders:
    for stage, key in [('design', 'designHours'), ('milling', 'millingHours'),
                        ('joinery', 'joineryHours'), ('finishing', 'finishingHours')]:
        if o[key]:
            stage_hours[stage] += o[key]
            stage_counts[stage] += 1

avg_stage_hours = {
    s: round(stage_hours[s] / stage_counts[s], 2) if stage_counts[s] else 0
    for s in stage_hours
}
slowest_stage = max(avg_stage_hours, key=avg_stage_hours.get)

quarter_late = defaultdict(lambda: {'late': 0, 'total': 0})
for o in delivered_orders:
    if o['completionDate']:
        q = quarter_of(o['completionDate'])
        quarter_late[q]['total'] += 1
        if o['isLate']:
            quarter_late[q]['late'] += 1

bottleneck_summary = {
    'slowestStageByAvgHours': slowest_stage,
    'avgHoursByStage': avg_stage_hours,
    'lateDeliveryRateByQuarter': {
        q: round((v['late'] / v['total']) * 100, 1) if v['total'] else 0
        for q, v in sorted(quarter_late.items())
    },
    'note': 'Derived directly from orders_data.csv designHours/millingHours/joineryHours/finishingHours and deliveryStatus — not hand-written commentary.'
}

# Legacy per-quarter bottleneck cards for older UI components (BottlenecksTab, ReportModal, etc.)
# — same shape as before, but every number is computed live from real data instead of hand-typed.
resign_by_quarter = defaultdict(list)
for e in hr_events:
    if e['event'] == 'Resignation':
        resign_by_quarter[quarter_of(e['date'])].append(e['employeeId'])

quarter_leadtime = defaultdict(lambda: {'sum': 0, 'count': 0, 'max': 0})
for o in delivered_orders:
    if o['completionDate'] and o['leadTimeDays'] is not None:
        q = quarter_of(o['completionDate'])
        quarter_leadtime[q]['sum'] += o['leadTimeDays']
        quarter_leadtime[q]['count'] += 1
        quarter_leadtime[q]['max'] = max(quarter_leadtime[q]['max'], o['leadTimeDays'])

bottlenecks_legacy = []
for q_name in sorted(quarter_late.keys()):
    late, total = quarter_late[q_name]['late'], quarter_late[q_name]['total']
    late_pct = round((late / total) * 100, 1) if total else 0
    lt = quarter_leadtime.get(q_name, {'sum': 0, 'count': 0, 'max': 0})
    avg_lt = round(lt['sum'] / lt['count'], 1) if lt['count'] else 0
    resignations = resign_by_quarter.get(q_name, [])
    severity = 'CRITICAL' if late_pct >= 25 else ('HIGH' if late_pct >= 15 else ('MODERATE' if late_pct >= 5 else 'LOW'))
    root_cause = (
        f"{late} of {total} delivered orders ({late_pct}%) exceeded a 14-day lead time this quarter."
        + (f" {len(resignations)} staff resignation(s) occurred: {', '.join(resignations)}." if resignations else " No staff resignations recorded this quarter.")
    )
    operational_impact = f"Average lead time was {avg_lt} days (max {lt['max']} days) across {total} delivered orders."
    bottlenecks_legacy.append({
        'quarter': q_name,
        'title': f"{late_pct}% Late Delivery Rate" if total else "No deliveries recorded",
        'severity': severity,
        'type': 'Production Throughput & Lead Time',
        'rootCause': root_cause,
        'operationalImpact': operational_impact,
        'metrics': f"{late_pct}% late ({late}/{total}); avg lead time {avg_lt} days; {len(resignations)} resignation(s)."
    })

# --- 6. Totals ---
# IMPORTANT: financial_ledger.csv only covers 2025-01-02 to 2025-08-31, while
# orders_data.csv runs all the way to 2027-01-01. Mixing full-period order revenue
# with the partial-period ledger costs would silently compare different time spans.
# So these are kept as two clearly separate, internally-consistent totals instead
# of being blended into one misleading "net cash flow" figure.
LEDGER_START, LEDGER_END = '2025-01-02', '2025-08-31'

status_counts = defaultdict(int)
for o in orders:
    status_counts[o['status']] += 1

# (a) Full pipeline, from orders_data.csv — every order the business ever quoted.
full_pipeline_revenue = sum(o['actualRevenue'] for o in orders if o['status'] == 'DELIVERED')

# (b) Ledger-period figures, from financial_ledger.csv — genuine cash in/out, Jan-Aug 2025 only.
ledger_revenue = sum(float(f['amount']) for f in finances if f['type'] == 'REVENUE')
ledger_costs = sum(float(f['amount']) for f in finances if f['type'] == 'COST')
ledger_net = ledger_revenue - ledger_costs

# Orders actually delivered within the ledger's own date window, for a like-for-like check.
ledger_window_delivered = [
    o for o in orders
    if o['status'] == 'DELIVERED' and o['completionDate']
    and LEDGER_START <= o['completionDate'] <= LEDGER_END
]

full_store = {
    'orders': orders,
    'productProfitability': product_profitability,
    'quarterlyData': quarterly_data,
    'monthlyData': monthly_data,
    'materialSummary': material_summary,
    'bottleneckSummary': bottleneck_summary,
    'bottlenecks': bottlenecks_legacy,  # back-compat: legacy per-quarter shape, now computed for real
    'employees': employees,
    'hrEvents': hr_events,
    'dataScopeNote': (
        f"financial_ledger.csv only covers {LEDGER_START} to {LEDGER_END}. "
        f"orders_data.csv covers {min(o['creationDate'] for o in orders)} to "
        f"{max(o['creationDate'] for o in orders)}. Revenue/cost totals below are kept "
        f"separate by source for this reason — do not sum them together."
    ),
    'totals': {
        'totalOrders': len(orders),
        'deliveredOrders': status_counts.get('DELIVERED', 0),
        'lostOrders': status_counts.get('LOST', 0),
        'inProductionOrders': len(orders) - status_counts.get('DELIVERED', 0) - status_counts.get('LOST', 0),
        'overallWinRatePct': round(
            status_counts.get('DELIVERED', 0) /
            (status_counts.get('DELIVERED', 0) + status_counts.get('LOST', 0)) * 100, 1
        ) if (status_counts.get('DELIVERED', 0) + status_counts.get('LOST', 0)) else None,
        'fullPipelineQuotedRevenue': round(full_pipeline_revenue, 2),
        'ledgerPeriod': f"{LEDGER_START} to {LEDGER_END}",
        'ledgerRevenue': round(ledger_revenue, 2),
        'ledgerCosts': round(ledger_costs, 2),
        'ledgerNetCashFlow': round(ledger_net, 2),
        'deliveredOrdersWithinLedgerWindow': len(ledger_window_delivered),
        'activeStaff': sum(1 for e in employees if e['status'] == 'Active'),
        'resignedStaff': sum(1 for e in employees if e['status'] == 'Resigned'),
        # Back-compat aliases for older UI components (point at the ledger-period figures,
        # since those are genuine cash totals — NOT the same window as fullPipelineQuotedRevenue)
        'totalRevenue': round(ledger_revenue, 2),
        'totalCosts': round(ledger_costs, 2),
        'netCashFlow': round(ledger_net, 2),
    }
}

with open('src/data/analyticsStore.json', 'w') as f:
    json.dump(full_store, f, indent=2)

print(f"Regenerated analyticsStore.json from the REAL orders_data.csv: {len(orders)} orders "
      f"({status_counts.get('DELIVERED',0)} delivered, {status_counts.get('LOST',0)} lost, "
      f"{len(orders) - status_counts.get('DELIVERED',0) - status_counts.get('LOST',0)} in production).")
print("Product types found:", sorted(prod_stats.keys()))
