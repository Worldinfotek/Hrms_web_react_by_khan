export const PIPELINE_STAGES = ['Applied', 'Screening', 'Shortlisted', 'Interview', 'Selected', 'Rejected'] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export type VacancyStatus = 'Open' | 'On hold' | 'Closed';

export interface Vacancy {
  id: string;
  title: string;
  department: string;
  designation: string;
  experience: string;
  education: string;
  skills: string;
  openings: number;
  hiringManager: string;
  status: VacancyStatus;
}

export type InterviewMode = 'In person' | 'Video' | 'Phone';
export type Recommendation = 'Advance' | 'Hold' | 'Reject';
export type OfferStatus = 'Draft' | 'Sent' | 'Accepted' | 'Declined';

export interface Interview {
  id: string;
  date: string;
  panel: string;
  mode: InterviewMode;
  link: string;
  rating: number | null;
  notes: string;
  recommendation: Recommendation | '';
}

export interface Offer {
  salary: string;
  joiningDate: string;
  status: OfferStatus;
}

export interface Candidate {
  id: string;
  vacancyId: string;
  name: string;
  email: string;
  phone: string;
  stage: PipelineStage;
  source: string;
  cvFileName: string;
  cvDataUrl: string;
  interviews: Interview[];
  offer: Offer | null;
  converted: boolean;
}
