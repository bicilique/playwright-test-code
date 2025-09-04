import fs from 'fs';
import { parse } from 'csv-parse/sync';

export function loadCSV(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return parse(fileContent, {
    columns: true,   // first row = column names
    skip_empty_lines: true
  });
}
