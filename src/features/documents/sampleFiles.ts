/** Tiny in-browser files so seeded documents can be previewed without a server. */

function pdf(title: string): string {
  const safe = title.replace(/[()\\]/g, '');
  const stream = `BT /F1 16 Tf 36 120 Td (${safe}) Tj ET`;
  const objects = [
    '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj',
    '2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj',
    '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 420 220]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj',
    `4 0 obj<</Length ${stream.length}>>stream\n${stream}\nendstream endobj`,
    '5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj',
  ];
  let body = '%PDF-1.4\n';
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(body.length);
    body += `${obj}\n`;
  }
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n`;
  body += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i += 1) {
    body += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  body += `trailer<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${xref}\n%%EOF`;
  return `data:application/pdf;base64,${btoa(body)}`;
}

function card(lines: string[]): string {
  const text = lines
    .map(
      (line, index) =>
        `<text x="28" y="${72 + index * 36}" font-family="Segoe UI, sans-serif" font-size="20" fill="#1F4E79">${line}</text>`,
    )
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="240"><rect width="100%" height="100%" fill="#E8F2FC"/><rect x="12" y="12" width="496" height="216" fill="none" stroke="#2B7BCB" stroke-width="2"/>${text}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const sampleCnicImage = card(['CNIC', '35202-1234567-1', 'Imran Qureshi']);
export const sampleCnicExpiringImage = card(['CNIC', '35202-7654321-8', 'Ayesha Malik']);
export function samplePdf(title: string) {
  return pdf(title);
}

export const sampleContractV1 = pdf('Employment contract 2018 - original');
export const sampleContractV2 = pdf('Employment contract 2024 - revised');

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Could not read the file.'));
    reader.readAsDataURL(file);
  });
}

export function downloadDataUrl(dataUrl: string, fileName: string) {
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = fileName;
  anchor.click();
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
