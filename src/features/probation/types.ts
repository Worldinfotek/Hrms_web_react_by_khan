export type ProbationOutcome = 'Awaiting' | 'Confirmed' | 'Extended' | 'Not confirmed';
export type Recommendation = 'Confirm' | 'Extend' | 'Do not confirm';

export interface CriterionScore {
  name: string;
  score: number;
}

export interface Evaluation {
  criteria: CriterionScore[];
  comments: string;
  recommendation: Recommendation;
}

export interface ProbationCase {
  employeeCode: string;
  employeeName: string;
  department: string;
  probationEnd: string;
  extendedEnd: string | null;
  confirmationDate: string | null;
  outcome: ProbationOutcome;
  evaluation: Evaluation | null;
  decisionComment: string;
  letterFileName: string | null;
  letterDataUrl: string | null;
}

export const CRITERIA = ['Job knowledge', 'Quality of work', 'Teamwork', 'Attendance'];
