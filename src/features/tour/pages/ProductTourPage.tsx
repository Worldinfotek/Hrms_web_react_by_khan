import { Card, List, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/shared/components';

const STEPS: Array<{ title: string; detail: string; links: Array<{ label: string; to: string }> }> = [
  {
    title: 'Sign in',
    detail: 'You are already signed in as Super Admin.',
    links: [{ label: 'Home', to: '/' }],
  },
  {
    title: 'Organization and one employee',
    detail: 'Organization is live data. Open Imran Qureshi.',
    links: [
      { label: 'Organization', to: '/settings/organization' },
      { label: 'Imran Qureshi', to: '/employees/1' },
    ],
  },
  {
    title: 'Documents',
    detail: 'Open his Documents tab, then the missing-document list.',
    links: [
      { label: 'Imran’s documents', to: '/employees/1?tab=documents' },
      { label: 'Missing documents', to: '/documents/missing' },
    ],
  },
  {
    title: 'Shifts, attendance, and a correction',
    detail: 'Shifts, today’s board, then corrections.',
    links: [
      { label: 'Shifts', to: '/settings/shifts' },
      { label: 'Today’s attendance', to: '/attendance' },
      { label: 'Corrections', to: '/attendance/corrections' },
    ],
  },
  {
    title: 'Leave',
    detail: 'Requests, then the team calendar.',
    links: [
      { label: 'Leave requests', to: '/leave' },
      { label: 'Team calendar', to: '/leave/calendar' },
    ],
  },
  {
    title: 'Recruitment',
    detail: 'Vacancy board, Sara Khan, then the convert wizard.',
    links: [
      { label: 'Vacancies', to: '/recruitment' },
      { label: 'Sara Khan', to: '/recruitment/candidates/candidate-sara' },
      { label: 'Convert wizard', to: '/recruitment/candidates/candidate-sara/convert' },
    ],
  },
  {
    title: 'Onboarding',
    detail: 'Hiba Noor’s checklist.',
    links: [{ label: 'Hiba Noor', to: '/onboarding/joiner-hiba' }],
  },
  {
    title: 'Probation',
    detail: 'Ali Raza is already confirmed.',
    links: [{ label: 'Ali Raza', to: '/probation/WIT-0007' }],
  },
  {
    title: 'Payroll',
    detail: 'Open this month’s run. Calculate it before opening a payslip.',
    links: [{ label: 'This month’s run', to: '/payroll/runs/run-current' }],
  },
  {
    title: 'Employee view, then manager view',
    detail: 'Turn on View as employee, then View as manager, and approve the pending leave.',
    links: [
      { label: 'Self-service', to: '/ess' },
      { label: 'Approvals', to: '/manager/inbox' },
    ],
  },
  {
    title: 'Bell',
    detail: 'Open the bell in the header. History is here if you want the full list.',
    links: [{ label: 'Alert history', to: '/notifications' }],
  },
  {
    title: 'Resignation and one clearance',
    detail: 'Nida Farooq is in clearance. Sign off one open area.',
    links: [{ label: 'Nida Farooq', to: '/offboarding/exit-nida' }],
  },
  {
    title: 'HR dashboard and one report',
    detail: 'The home switch starts on HR. Then export one report.',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Reports', to: '/reports' },
    ],
  },
  {
    title: 'API clients and the sample punch',
    detail: 'Open the clients, then send the sample punch and look at today’s attendance.',
    links: [
      { label: 'API clients', to: '/settings/api-clients' },
      { label: 'Integration monitor', to: '/integrations' },
    ],
  },
];

export default function ProductTourPage() {
  return (
    <>
      <PageHeader
        title="Product tour"
        subtitle="The click path for the CTO. It links to screens that are already built. It is not a new HR module."
      />
      <Card styles={{ body: { padding: 16 } }}>
        <List
          dataSource={STEPS}
          renderItem={(step, index) => (
            <List.Item>
              <List.Item.Meta
                title={`${index + 1}. ${step.title}`}
                description={
                  <>
                    <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
                      {step.detail}
                    </Typography.Paragraph>
                    {step.links.map((link) => (
                      <Link key={link.to} to={link.to} style={{ marginRight: 16 }}>
                        {link.label}
                      </Link>
                    ))}
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </>
  );
}
