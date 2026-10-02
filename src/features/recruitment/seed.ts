import dayjs from 'dayjs';
import { samplePdf } from '@/features/documents/sampleFiles';
import type { Candidate, Vacancy } from './types';

export const VACANCY_SE = 'vacancy-se';

export function createSeedVacancies(): Vacancy[] {
  return [
    {
      id: VACANCY_SE,
      title: 'Software Engineer',
      department: 'Technology',
      designation: 'Software Engineer',
      experience: '2–4 years',
      education: 'Bachelor in Computer Science',
      skills: 'React, TypeScript',
      openings: 1,
      hiringManager: 'Sana Tariq',
      status: 'Open',
    },
  ];
}

export function createSeedCandidates(): Candidate[] {
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
  const lastWeek = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
  const joining = dayjs().add(1, 'month').startOf('month').format('YYYY-MM-DD');
  return [
    {
      id: 'candidate-sara',
      vacancyId: VACANCY_SE,
      name: 'Sara Khan',
      email: 'sara.khan@email.com',
      phone: '0300-1112233',
      stage: 'Selected',
      source: 'Referral',
      cvFileName: 'Sara-Khan-CV.pdf',
      cvDataUrl: samplePdf('Sara Khan - CV - Software Engineer'),
      interviews: [
        {
          id: 'interview-sara',
          date: lastWeek,
          panel: 'Sana Tariq, Usman Khan',
          mode: 'In person',
          link: '',
          rating: 5,
          notes: 'Strong React work and clear communication.',
          recommendation: 'Advance',
        },
      ],
      offer: { salary: 'PKR 180,000', joiningDate: joining, status: 'Accepted' },
      converted: false,
    },
    {
      id: 'candidate-omar',
      vacancyId: VACANCY_SE,
      name: 'Omar Farooq',
      email: 'omar.farooq@email.com',
      phone: '0301-2223344',
      stage: 'Interview',
      source: 'Careers page',
      cvFileName: 'Omar-Farooq-CV.pdf',
      cvDataUrl: samplePdf('Omar Farooq - CV - Software Engineer'),
      interviews: [
        {
          id: 'interview-omar',
          date: tomorrow,
          panel: 'Sana Tariq, Usman Khan',
          mode: 'Video',
          link: 'https://meet.example/wit-omar',
          rating: null,
          notes: '',
          recommendation: '',
        },
      ],
      offer: null,
      converted: false,
    },
    {
      id: 'candidate-nadia',
      vacancyId: VACANCY_SE,
      name: 'Nadia Hussain',
      email: 'nadia.hussain@email.com',
      phone: '0321-5556677',
      stage: 'Screening',
      source: 'LinkedIn',
      cvFileName: 'Nadia-Hussain-CV.pdf',
      cvDataUrl: samplePdf('Nadia Hussain - CV'),
      interviews: [],
      offer: null,
      converted: false,
    },
    {
      id: 'candidate-kamran',
      vacancyId: VACANCY_SE,
      name: 'Kamran Ali',
      email: 'kamran.ali@email.com',
      phone: '0333-8889900',
      stage: 'Applied',
      source: 'Careers page',
      cvFileName: 'Kamran-Ali-CV.pdf',
      cvDataUrl: samplePdf('Kamran Ali - CV'),
      interviews: [],
      offer: null,
      converted: false,
    },
  ];
}
