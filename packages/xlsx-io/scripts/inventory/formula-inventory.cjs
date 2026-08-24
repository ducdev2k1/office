/* eslint-disable */
// Headless inventory of formula functions implemented by @univerjs/engine-formula.
// Compares against a baseline list of core Google Sheets / Excel functions.
const path = require('path');
process.chdir(path.join(__dirname, '..', '..', 'src', '__tests__', 'node'));
require('tsx/cjs');

const { ALL_IMPLEMENTED_FUNCTIONS_SET } = require('@univerjs/engine-formula');

const BASELINE = {
  'Toán': ['SUM','SUMIF','SUMIFS','SUMPRODUCT','ABS','ROUND','ROUNDUP','ROUNDDOWN','INT','MOD','POWER','SQRT','EXP','LN','LOG','RAND','RANDBETWEEN','PI','PRODUCT','QUOTIENT','TRUNC'],
  'Logic': ['IF','IFS','AND','OR','NOT','XOR','TRUE','FALSE','IFERROR','IFNA','SWITCH'],
  'Thống kê': ['COUNT','COUNTA','COUNTBLANK','COUNTIF','COUNTIFS','AVERAGE','AVERAGEA','AVERAGEIF','AVERAGEIFS','MAX','MIN','MAXIFS','MINIFS','MEDIAN','MODE','STDEV','STDEVP','VAR','VARP','LARGE','SMALL','RANK'],
  'Văn bản': ['CONCATENATE','CONCAT','TEXTJOIN','LEFT','RIGHT','MID','LEN','LOWER','UPPER','PROPER','TRIM','SUBSTITUTE','REPLACE','FIND','SEARCH','TEXT','VALUE','SPLIT','EXACT','REPT','CHAR','CODE'],
  'Ngày giờ': ['TODAY','NOW','DATE','TIME','YEAR','MONTH','DAY','HOUR','MINUTE','SECOND','WEEKDAY','WEEKNUM','DATEDIF','DAYS','EDATE','EOMONTH','DATEVALUE','TIMEVALUE'],
  'Tra cứu': ['VLOOKUP','HLOOKUP','INDEX','MATCH','XLOOKUP','OFFSET','CHOOSE','ROW','COLUMN','ROWS','COLUMNS','TRANSPOSE','INDIRECT','ADDRESS','LOOKUP','UNIQUE','SORT','FILTER'],
  'Tài chính': ['PV','FV','NPV','IRR','PMT','RATE','NPER','SLN'],
};

const registered = ALL_IMPLEMENTED_FUNCTIONS_SET;
let totalBaseline = 0;
let totalMissing = 0;
const lines = [];
for (const [group, fns] of Object.entries(BASELINE)) {
  totalBaseline += fns.length;
  const missing = fns.filter((f) => !registered.has(f));
  totalMissing += missing.length;
  const present = fns.length - missing.length;
  lines.push(
    `- **${group}**: ${present}/${fns.length}` + (missing.length ? ` — thiếu: ${missing.join(', ')}` : ' — đủ'),
  );
}

console.log(`Tổng số hàm engine đã cài đặt: ${registered.size}`);
console.log(`Baseline kiểm kê: ${totalBaseline - totalMissing}/${totalBaseline}`);
console.log(lines.join('\n'));
