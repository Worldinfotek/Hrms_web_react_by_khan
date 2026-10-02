export type TaskOwner = 'HR' | 'IT' | 'Admin' | 'Manager' | 'Employee';

export const TASK_OWNERS: TaskOwner[] = ['HR', 'IT', 'Admin', 'Manager', 'Employee'];

export interface OnboardingTask {
  id: string;
  name: string;
  owner: TaskOwner;
  dueDay: number;
  done: boolean;
}

export interface OnboardingTemplate {
  id: string;
  name: string;
  department: string;
  designation: string;
  employmentType: string;
  tasks: Omit<OnboardingTask, 'done'>[];
}

export interface RequiredDocument {
  name: string;
  received: boolean;
}

export interface OrientationItem {
  id: string;
  name: string;
  done: boolean;
}

export interface Joiner {
  id: string;
  name: string;
  employeeCode: string | null;
  department: string;
  designation: string;
  employmentType: string;
  startDate: string;
  templateId: string;
  tasks: OnboardingTask[];
  documents: RequiredDocument[];
  policyAcknowledged: boolean;
  orientation: OrientationItem[];
}

export function progressPercent(joiner: Pick<Joiner, 'tasks'>) {
  if (joiner.tasks.length === 0) return 0;
  const done = joiner.tasks.filter((task) => task.done).length;
  return Math.round((done / joiner.tasks.length) * 100);
}
