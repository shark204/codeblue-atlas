// lib/csv.ts

/** Downloads an array of objects as a UTF-8 CSV file. */
export function downloadCsv(filename: string, rows: Record<string, any>[]) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;

  const csv =
    '\uFEFF' + // BOM so Excel reads Arabic/UTF-8 correctly
    [
      headers.join(','),
      ...rows.map(row => headers.map(h => escape(row[h])).join(',')),
    ].join('\n');

  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}