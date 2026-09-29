function toCSV(rows, columns) {
  const escape = (val) => {
    if (val == null) return '';
    const str = String(val).replace(/"/g, '""');
    return /[",\n]/.test(str) ? `"${str}"` : str;
  };
  const header = columns.map((c) => escape(c.label)).join(',');
  const lines = rows.map((row) => columns.map((c) => escape(c.value(row))).join(','));
  return ['﻿' + header, ...lines].join('\n'); // BOM for Excel Arabic support
}

module.exports = { toCSV };
