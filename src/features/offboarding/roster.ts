export const ROSTER = [
  { code: 'WIT-0001', name: 'Imran Qureshi', department: 'Management', designation: 'Chief Executive Officer' },
  { code: 'WIT-0002', name: 'Sana Tariq', department: 'Technology', designation: 'Chief Technology Officer' },
  { code: 'WIT-0003', name: 'Ayesha Malik', department: 'Human Resources', designation: 'HR Manager' },
  { code: 'WIT-0004', name: 'Bilal Ahmed', department: 'Finance', designation: 'Finance Manager' },
  { code: 'WIT-0005', name: 'Usman Khan', department: 'Software Development', designation: 'Team Lead' },
  { code: 'WIT-0006', name: 'Hira Shah', department: 'Software Development', designation: 'Senior Software Engineer' },
  { code: 'WIT-0007', name: 'Ali Raza', department: 'Software Development', designation: 'Software Engineer' },
  { code: 'WIT-0008', name: 'Fatima Noor', department: 'Quality Assurance', designation: 'SQA Engineer' },
  { code: 'WIT-0009', name: 'Zain Abbas', department: 'Human Resources', designation: 'HR Executive' },
  { code: 'WIT-0010', name: 'Maryam Iqbal', department: 'Finance', designation: 'Accountant' },
  { code: 'WIT-0011', name: 'Hamza Yousaf', department: 'Software Development', designation: 'Intern' },
  { code: 'WIT-0012', name: 'Nida Farooq', department: 'Administration', designation: 'Admin Officer' },
] as const;

export function personByCode(code: string) {
  return ROSTER.find((item) => item.code === code);
}
