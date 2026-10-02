import dayjs from 'dayjs';
import type { Joiner, OnboardingTemplate } from './types';

export const TEMPLATE_TECH = 'template-tech';

const templateTasks = [
  { id: 'task-hr-intro', name: 'HR introduction', owner: 'HR' as const, dueDay: 0 },
  { id: 'task-laptop', name: 'Laptop and access', owner: 'IT' as const, dueDay: 1 },
  { id: 'task-id-card', name: 'ID card', owner: 'Admin' as const, dueDay: 2 },
  { id: 'task-policy', name: 'Policy acknowledgement', owner: 'Employee' as const, dueDay: 2 },
  { id: 'task-orientation', name: 'Team orientation', owner: 'Manager' as const, dueDay: 3 },
];

export function createSeedTemplates(): OnboardingTemplate[] {
  return [
    {
      id: TEMPLATE_TECH,
      name: 'Technology joiner',
      department: 'Technology',
      designation: 'Software Engineer',
      employmentType: 'Permanent',
      tasks: templateTasks,
    },
  ];
}

export function createSeedJoiners(): Joiner[] {
  const hibaStart = dayjs().subtract(10, 'day').format('YYYY-MM-DD');
  const hamzaStart = dayjs().subtract(20, 'day').format('YYYY-MM-DD');
  return [
    {
      id: 'joiner-hiba',
      name: 'Hiba Noor',
      employeeCode: null,
      department: 'Technology',
      designation: 'Software Engineer',
      employmentType: 'Permanent',
      startDate: hibaStart,
      templateId: TEMPLATE_TECH,
      tasks: templateTasks.map((task) => ({
        ...task,
        done: task.id !== 'task-laptop' && task.id !== 'task-policy',
      })),
      documents: [
        { name: 'CNIC', received: true },
        { name: 'Degree', received: false },
      ],
      policyAcknowledged: false,
      orientation: [
        { id: 'ori-office', name: 'Office walkthrough', done: true },
        { id: 'ori-tools', name: 'Tools and accounts overview', done: false },
      ],
    },
    {
      id: 'joiner-hamza',
      name: 'Hamza Yousaf',
      employeeCode: 'WIT-0011',
      department: 'Software Development',
      designation: 'Intern',
      employmentType: 'Intern',
      startDate: hamzaStart,
      templateId: TEMPLATE_TECH,
      tasks: templateTasks.map((task) => ({ ...task, id: `hamza-${task.id}`, done: true })),
      documents: [
        { name: 'CNIC', received: true },
        { name: 'Degree', received: true },
      ],
      policyAcknowledged: true,
      orientation: [
        { id: 'ori-office', name: 'Office walkthrough', done: true },
        { id: 'ori-tools', name: 'Tools and accounts overview', done: true },
      ],
    },
  ];
}
