import dayjs from 'dayjs';
import {
  sampleCnicExpiringImage,
  sampleCnicImage,
  sampleContractV1,
  sampleContractV2,
} from './sampleFiles';
import type { DocumentType, EmployeeDocument } from './types';

export const TYPE_CNIC = 'type-cnic';
export const TYPE_CONTRACT = 'type-contract';
export const TYPE_DEGREE = 'type-degree';

export function createSeedTypes(): DocumentType[] {
  return [
    {
      id: TYPE_CNIC,
      category: 'Identity',
      name: 'CNIC',
      mandatory: true,
      expiryRequired: true,
      sensitive: true,
      isActive: true,
    },
    {
      id: TYPE_CONTRACT,
      category: 'Employment',
      name: 'Employment contract',
      mandatory: true,
      expiryRequired: false,
      sensitive: false,
      isActive: true,
    },
    {
      id: TYPE_DEGREE,
      category: 'Education',
      name: 'Degree',
      mandatory: true,
      expiryRequired: false,
      sensitive: false,
      isActive: true,
    },
  ];
}

export function createSeedDocuments(): EmployeeDocument[] {
  const today = dayjs().startOf('day');
  return [
    {
      id: 'doc-imran-cnic',
      employeeCode: 'WIT-0001',
      documentTypeId: TYPE_CNIC,
      documentNumber: '35202-1234567-1',
      issueDate: today.subtract(4, 'year').format('YYYY-MM-DD'),
      expiryDate: today.add(3, 'year').format('YYYY-MM-DD'),
      versions: [
        {
          id: 'ver-imran-cnic',
          fileName: 'imran-qureshi-cnic.svg',
          mimeType: 'image/svg+xml',
          size: 900,
          uploadedAt: today.subtract(4, 'year').toISOString(),
          dataUrl: sampleCnicImage,
          remarks: 'CNIC copy on file',
        },
      ],
    },
    {
      id: 'doc-imran-contract',
      employeeCode: 'WIT-0001',
      documentTypeId: TYPE_CONTRACT,
      documentNumber: 'WIT-CTR-2018-001',
      issueDate: today.subtract(8, 'year').format('YYYY-MM-DD'),
      expiryDate: null,
      versions: [
        {
          id: 'ver-imran-contract-2',
          fileName: 'imran-qureshi-contract-2024.pdf',
          mimeType: 'application/pdf',
          size: 1200,
          uploadedAt: today.subtract(2, 'month').toISOString(),
          dataUrl: sampleContractV2,
          remarks: 'Revised contract',
        },
        {
          id: 'ver-imran-contract-1',
          fileName: 'imran-qureshi-contract-2018.pdf',
          mimeType: 'application/pdf',
          size: 1100,
          uploadedAt: today.subtract(8, 'year').toISOString(),
          dataUrl: sampleContractV1,
          remarks: 'Original contract',
        },
      ],
    },
    {
      id: 'doc-imran-degree',
      employeeCode: 'WIT-0001',
      documentTypeId: TYPE_DEGREE,
      documentNumber: 'PU-MBA-2008',
      issueDate: today.subtract(18, 'year').format('YYYY-MM-DD'),
      expiryDate: null,
      versions: [
        {
          id: 'ver-imran-degree',
          fileName: 'imran-qureshi-degree.pdf',
          mimeType: 'application/pdf',
          size: 1000,
          uploadedAt: today.subtract(8, 'year').toISOString(),
          dataUrl: pdfPlaceholder('Degree - Imran Qureshi'),
          remarks: 'MBA degree',
        },
      ],
    },
    {
      id: 'doc-ayesha-cnic',
      employeeCode: 'WIT-0003',
      documentTypeId: TYPE_CNIC,
      documentNumber: '35202-7654321-8',
      issueDate: today.subtract(10, 'year').format('YYYY-MM-DD'),
      expiryDate: today.add(18, 'day').format('YYYY-MM-DD'),
      versions: [
        {
          id: 'ver-ayesha-cnic',
          fileName: 'ayesha-malik-cnic.svg',
          mimeType: 'image/svg+xml',
          size: 900,
          uploadedAt: today.subtract(1, 'year').toISOString(),
          dataUrl: sampleCnicExpiringImage,
          remarks: 'Expires this month',
        },
      ],
    },
    {
      id: 'doc-ayesha-contract',
      employeeCode: 'WIT-0003',
      documentTypeId: TYPE_CONTRACT,
      documentNumber: 'WIT-CTR-2021-014',
      issueDate: today.subtract(5, 'year').format('YYYY-MM-DD'),
      expiryDate: null,
      versions: [
        {
          id: 'ver-ayesha-contract',
          fileName: 'ayesha-malik-contract.pdf',
          mimeType: 'application/pdf',
          size: 1100,
          uploadedAt: today.subtract(5, 'year').toISOString(),
          dataUrl: pdfPlaceholder('Employment contract - Ayesha Malik'),
          remarks: 'HR manager contract',
        },
      ],
    },
  ];
}

function pdfPlaceholder(title: string): string {
  const safe = title.replace(/[()\\]/g, '');
  const stream = `BT /F1 14 Tf 36 120 Td (${safe}) Tj ET`;
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
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i += 1) {
    body += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  body += `trailer<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${xref}\n%%EOF`;
  return `data:application/pdf;base64,${btoa(body)}`;
}
