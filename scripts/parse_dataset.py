import json
import csv
import io
import re

print("Starting parser")

# Read rawCsvData.ts
with open('src/data/rawCsvData.ts', 'r') as f:
    content = f.read()

# Extract DESIGNER_LOGS_CSV
designer_csv_match = re.search(r'export const DESIGNER_LOGS_CSV = `([^`]+)`', content)
designer_csv = designer_csv_match.group(1).strip() if designer_csv_match else ""

# Extract EMPLOYEES_CSV
employees_csv_match = re.search(r'export const EMPLOYEES_CSV = `([^`]+)`', content)
employees_csv = employees_csv_match.group(1).strip() if employees_csv_match else ""

# Read rawHrInventoryData.ts
with open('src/data/rawHrInventoryData.ts', 'r') as f:
    hr_content = f.read()

hr_csv_match = re.search(r'export const HR_EVENTS_CSV = `([^`]+)`', hr_content)
hr_csv = hr_csv_match.group(1).strip() if hr_csv_match else ""

mat_csv_match = re.search(r'export const MATERIALS_INVENTORY_CSV = `([^`]+)`', hr_content)
mat_csv = mat_csv_match.group(1).strip() if mat_csv_match else ""

print(f"Designer CSV lines: {len(designer_csv.splitlines())}")
print(f"Employees CSV lines: {len(employees_csv.splitlines())}")
print(f"HR CSV lines: {len(hr_csv.splitlines())}")
print(f"Materials CSV lines: {len(mat_csv.splitlines())}")

# Parse CSVs to list of dicts
def parse_csv_str(csv_str):
    reader = csv.DictReader(io.StringIO(csv_str.strip()))
    return list(reader)

designer_logs = parse_csv_str(designer_csv)
employees = parse_csv_str(employees_csv)
hr_events = parse_csv_str(hr_csv)
materials_inventory = parse_csv_str(mat_csv)

# Also read finances.csv
with open('src/data/csv/finances.csv', 'r') as f:
    finances = list(csv.DictReader(f))
print(f"Finances rows: {len(finances)}")

with open('src/data/designer_logs.json', 'w') as f:
    json.dump(designer_logs, f, indent=2)

with open('src/data/employees.json', 'w') as f:
    json.dump(employees, f, indent=2)

with open('src/data/hr_events.json', 'w') as f:
    json.dump(hr_events, f, indent=2)

with open('src/data/materials_inventory.json', 'w') as f:
    json.dump(materials_inventory, f, indent=2)

with open('src/data/finances.json', 'w') as f:
    json.dump(finances, f, indent=2)

print("Saved base json files successfully!")
