import json

with open('src/data/analyticsStore.json') as f:
    data = json.load(f)

orders = data['orders']
totals = data['totals']
prods = data['productProfitability']
quarters = data['quarterlyData']
months = data['monthlyData']
bottlenecks = data['bottlenecks']
materials = data['materialSummary']

print("=== 1. AUDIT CHECK: ORDER COUNTS & STATUS ===")
print(f"Total Orders: {len(orders)} (Store totals: {totals['totalOrders']})")
assert len(orders) == totals['totalOrders'] == 160
delivered = sum(1 for o in orders if o['status'] == 'DELIVERED')
in_prod = sum(1 for o in orders if o['status'] == 'IN_PRODUCTION')
print(f"Delivered: {delivered} (Store totals: {totals['deliveredOrders']})")
print(f"In Production: {in_prod} (Store totals: {totals['inProductionOrders']})")
assert delivered == totals['deliveredOrders'] == 152
assert in_prod == totals['inProductionOrders'] == 8

print("\n=== 2. AUDIT CHECK: REVENUE & COSTS HARMONIZATION ===")
sum_order_rev = sum(o['actualRevenue'] for o in orders)
sum_prod_rev = sum(p['totalRevenue'] for p in prods)
sum_quarter_rev = sum(q['revenue'] for q in quarters)
sum_month_rev = sum(m['revenue'] for m in months)
total_rev = totals['totalRevenue']

print(f"Orders Revenue Sum:   ${sum_order_rev:,.2f}")
print(f"Product Revenue Sum:  ${sum_prod_rev:,.2f}")
print(f"Quarter Revenue Sum:  ${sum_quarter_rev:,.2f}")
print(f"Month Revenue Sum:    ${sum_month_rev:,.2f}")
print(f"Store Total Revenue:  ${total_rev:,.2f}")

assert abs(sum_order_rev - total_rev) < 0.10
assert abs(sum_prod_rev - total_rev) < 0.10
assert abs(sum_quarter_rev - total_rev) < 0.10
assert abs(sum_month_rev - total_rev) < 0.10

sum_quarter_costs = sum(q['totalCosts'] for q in quarters)
sum_month_costs = sum(m['costs'] for m in months)
total_costs = totals['totalCosts']

print(f"\nQuarter Costs Sum:    ${sum_quarter_costs:,.2f}")
print(f"Month Costs Sum:      ${sum_month_costs:,.2f}")
print(f"Store Total Costs:    ${total_costs:,.2f}")
assert abs(sum_quarter_costs - total_costs) < 0.10
assert abs(sum_month_costs - total_costs) < 0.10

net_cash = totals['netCashFlow']
print(f"Net Cash Flow:        ${net_cash:,.2f} (${total_rev:,.2f} - ${total_costs:,.2f})")
assert abs(net_cash - (total_rev - total_costs)) < 0.10

print("\n=== 3. AUDIT CHECK: LEAD TIME & DELAY DISTRIBUTION ===")
lts = [o['leadTimeDays'] for o in orders]
avg_lt = sum(lts) / len(lts)
min_lt = min(lts)
max_lt = max(lts)
late_count = sum(1 for o in orders if o['isLate'])
print(f"Lead Time: Min={min_lt}d, Max={max_lt}d, Avg={avg_lt:.2f}d")
print(f"Late orders (>14d): {late_count} / {len(orders)} ({late_count/len(orders)*100:.1f}%)")

print("\n=== 4. AUDIT CHECK: TIMBER SUMMARY ===")
for m in materials:
    print(f"  {m['material']}: consumed={m['totalConsumedM3']}m³, reordered={m['totalReorderedM3']}m³, spend=${m['totalSpent']:,.2f}, unitCost=${m['unitCost']}/m³, zero_days={m['stockoutDates']}")

print("\n=== ALL AUDIT CHECKS PASSED PERFECTLY ===")
