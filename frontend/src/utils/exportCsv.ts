/**
 * Universal CSV Export Utility
 * Converts an array of objects into a properly escaped CSV string and triggers a browser download.
 */
export function exportToCsv<T extends Record<string, any>>(
  filename: string,
  data: T[],
  headers: { key: keyof T | string; label: string; formatter?: (val: any, row: T) => any }[]
): void {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  // 1. Build Header Row
  const headerRow = headers.map((h) => `"${h.label.replace(/"/g, '""')}"`).join(',');

  // 2. Build Data Rows
  const dataRows = data.map((row) => {
    return headers
      .map((h) => {
        let value = row[h.key as keyof T];
        if (h.formatter) {
          value = h.formatter(value, row);
        }

        if (value === null || value === undefined) {
          return '""';
        }

        const stringVal = String(value).replace(/"/g, '""');
        return `"${stringVal}"`;
      })
      .join(',');
  });

  // 3. Combine with BOM for Excel UTF-8 compatibility
  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // 4. Trigger Download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace(/\.csv$/i, '')}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
