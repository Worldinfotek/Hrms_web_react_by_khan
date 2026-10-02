import { samplePdf } from '@/features/documents/sampleFiles';

export function downloadText(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const lines = ['SAMPLE FILE - not a live export', headers.join(','), ...rows.map((row) => row.map(csvCell).join(','))];
  downloadText(filename, lines.join('\n'), 'text/csv');
}

export function downloadExcel(filename: string, headers: string[], rows: string[][]) {
  const head = headers.map((cell) => `<th>${escapeHtml(cell)}</th>`).join('');
  const body = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
    .join('');
  const html = `<html><body><p>SAMPLE FILE - not a live export</p><table><tr>${head}</tr>${body}</table></body></html>`;
  downloadText(filename, html, 'application/vnd.ms-excel');
}

export function downloadPdf(title: string) {
  const anchor = document.createElement('a');
  anchor.href = samplePdf(title);
  anchor.download = `${title.replace(/\s+/g, '-')}.pdf`;
  anchor.click();
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
