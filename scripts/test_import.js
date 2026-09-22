import fs from 'fs';
import path from 'path';

// Let's read the raw CSV data from rawCsvData.ts and rawHrInventoryData.ts that we already saved
import { DESIGNER_LOGS_CSV, EMPLOYEES_CSV } from '../src/data/rawCsvData.ts';
import { HR_EVENTS_CSV, MATERIALS_INVENTORY_CSV } from '../src/data/rawHrInventoryData.ts';

console.log('Reading base datasets...');
console.log('Designer logs lines:', DESIGNER_LOGS_CSV.split('\n').length);
console.log('Employees lines:', EMPLOYEES_CSV.split('\n').length);
console.log('HR events lines:', HR_EVENTS_CSV.split('\n').length);
console.log('Materials lines:', MATERIALS_INVENTORY_CSV.split('\n').length);
