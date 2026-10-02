import { App, Button, Card, Flex, Select, Table } from 'antd';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAttendanceStore } from '@/features/attendance/store';
import { useDocumentStore } from '@/features/documents/store';
import { useLeaveStore } from '@/features/leave/store';
import { useOffboardingStore } from '@/features/offboarding/store';
import { personByCode, ROSTER } from '@/features/offboarding/roster';
import { exitStage, settlementNet } from '@/features/offboarding/types';
import { lineNet } from '@/features/payroll/types';
import { usePayrollStore } from '@/features/payroll/store';
import { useProbationStore } from '@/features/probation/store';
import { useRecruitmentStore } from '@/features/recruitment/store';
import { PageHeader } from '@/shared/components';
import { formatDate } from '@/shared/utils/format';
import { downloadCsv, downloadExcel, downloadPdf } from '../download';

interface ReportRow {
  key: string;
  cells: string[];
}

interface ReportModel {
  id: string;
  group: string;
  name: string;
  headers: string[];
  filters: string[];
  rows: ReportRow[];
}

export default function ReportsPage() {
  const { message } = App.useApp();
  const days = useAttendanceStore((state) => state.days);
  const leave = useLeaveStore((state) => state.requests);
  const leaveTypes = useLeaveStore((state) => state.types);
  const runs = usePayrollStore((state) => state.runs);
  const components = usePayrollStore((state) => state.components);
  const candidates = useRecruitmentStore((state) => state.candidates);
  const probation = useProbationStore((state) => state.cases);
  const documents = useDocumentStore((state) => state.documents);
  const docTypes = useDocumentStore((state) => state.types);
  const exits = useOffboardingStore((state) => state.cases);

  const reports = useMemo<ReportModel[]>(() => {
    const current = runs.find((run) => run.id === 'run-current');
    return [
      {
        id: 'attendance',
        group: 'Attendance',
        name: 'Daily status',
        headers: ['Date', 'Employee', 'Status'],
        filters: ['All', ...Array.from(new Set(days.map((day) => day.status)))],
        rows: days.map((day) => ({
          key: day.id,
          cells: [formatDate(day.date), day.employeeName, day.status],
        })),
      },
      {
        id: 'leave',
        group: 'Leave',
        name: 'Leave requests',
        headers: ['Employee', 'Type', 'Start', 'Decision'],
        filters: ['All', 'Pending', 'Approved', 'Rejected'],
        rows: leave.map((item) => ({
          key: item.id,
          cells: [
            item.employeeName,
            leaveTypes.find((type) => type.id === item.leaveTypeId)?.name ?? item.leaveTypeId,
            formatDate(item.start),
            item.decision,
          ],
        })),
      },
      {
        id: 'payroll-summary',
        group: 'Payroll',
        name: 'Payroll summary',
        headers: ['Component', 'Kind', 'Total'],
        filters: ['All', 'Earning', 'Deduction'],
        rows: components.map((component) => ({
          key: component.id,
          cells: [
            component.name,
            component.kind,
            (current?.employees ?? [])
              .reduce((sum, person) => sum + (person.lines.find((line) => line.componentId === component.id)?.amount ?? 0), 0)
              .toLocaleString(),
          ],
        })),
      },
      {
        id: 'salary-components',
        group: 'Payroll',
        name: 'Salary components',
        headers: ['Component', 'Kind'],
        filters: ['All', 'Earning', 'Deduction'],
        rows: components.map((component) => ({ key: component.id, cells: [component.name, component.kind] })),
      },
      {
        id: 'deductions',
        group: 'Payroll',
        name: 'Deductions',
        headers: ['Component', 'Total'],
        filters: ['All'],
        rows: components
          .filter((component) => component.kind === 'Deduction')
          .map((component) => ({
            key: component.id,
            cells: [
              component.name,
              (current?.employees ?? [])
                .reduce((sum, person) => sum + (person.lines.find((line) => line.componentId === component.id)?.amount ?? 0), 0)
                .toLocaleString(),
            ],
          })),
      },
      {
        id: 'overtime',
        group: 'Payroll',
        name: 'Overtime',
        headers: ['Employee', 'Amount', 'Note'],
        filters: ['All'],
        rows: (current?.employees ?? []).flatMap((person) =>
          person.lines
            .filter((line) => line.componentId === 'comp-ot' && line.amount > 0)
            .map((line) => ({
              key: person.employeeCode,
              cells: [person.employeeName, line.amount.toLocaleString(), line.note || '—'],
            })),
        ),
      },
      {
        id: 'payslip-report',
        group: 'Payroll',
        name: 'Payslip report',
        headers: ['Month', 'Employee', 'Net'],
        filters: ['All', ...Array.from(new Set(runs.filter((run) => run.status !== 'Draft').map((run) => run.label)))],
        rows: runs
          .filter((run) => run.status !== 'Draft')
          .flatMap((run) =>
            run.employees.map((person) => ({
              key: `${run.id}-${person.employeeCode}`,
              cells: [run.label, person.employeeName, lineNet(person.lines, components).toLocaleString()],
            })),
          ),
      },
      {
        id: 'recruitment',
        group: 'Recruitment',
        name: 'Candidates',
        headers: ['Name', 'Stage'],
        filters: ['All', ...Array.from(new Set(candidates.map((item) => item.stage)))],
        rows: candidates.map((item) => ({ key: item.id, cells: [item.name, item.stage] })),
      },
      {
        id: 'employee',
        group: 'Employee',
        name: 'Employee master',
        headers: ['Code', 'Name', 'Department'],
        filters: ['All', ...Array.from(new Set(ROSTER.map((item) => item.department)))],
        rows: ROSTER.map((item) => ({ key: item.code, cells: [item.code, item.name, item.department] })),
      },
      {
        id: 'probation',
        group: 'Probation',
        name: 'Probation cases',
        headers: ['Employee', 'Outcome', 'End'],
        filters: ['All', 'Awaiting', 'Confirmed', 'Extended', 'Not confirmed'],
        rows: probation.map((item) => ({
          key: item.employeeCode,
          cells: [item.employeeName, item.outcome, formatDate(item.extendedEnd ?? item.probationEnd)],
        })),
      },
      {
        id: 'documents',
        group: 'Documents',
        name: 'Documents on file',
        headers: ['Employee', 'Type', 'Expiry'],
        filters: ['All', 'Has expiry', 'No expiry'],
        rows: documents.map((item) => ({
          key: item.id,
          cells: [
            personByCode(item.employeeCode)?.name ?? item.employeeCode,
            docTypes.find((type) => type.id === item.documentTypeId)?.name ?? item.documentTypeId,
            item.expiryDate ? formatDate(item.expiryDate) : 'No expiry',
          ],
        })),
      },
      {
        id: 'offboarding',
        group: 'Offboarding',
        name: 'Exits',
        headers: ['Employee', 'Stage', 'Settlement net'],
        filters: ['All', 'In clearance', 'Completed'],
        rows: exits.map((item) => ({
          key: item.id,
          cells: [item.employeeName, exitStage(item), item.settlement ? settlementNet(item.settlement).toLocaleString() : '—'],
        })),
      },
    ];
  }, [days, leave, leaveTypes, runs, components, candidates, probation, documents, docTypes, exits]);

  const [params] = useSearchParams();
  const requestedRaw = params.get('report');
  const requested = requestedRaw === 'payroll' ? 'payroll-summary' : requestedRaw;
  const [reportId, setReportId] = useState(
    requested && reports.some((item) => item.id === requested) ? requested : (reports[0]?.id ?? 'attendance'),
  );
  const report = reports.find((item) => item.id === reportId) ?? reports[0];
  const [filter, setFilter] = useState('All');
  const activeFilter = report.filters.includes(filter) ? filter : 'All';
  const rows = useMemo(() => {
    if (activeFilter === 'All') return report.rows;
    if (report.id === 'documents' && activeFilter === 'Has expiry') {
      return report.rows.filter((row) => row.cells[2] !== 'No expiry');
    }
    return report.rows.filter((row) => row.cells.some((cell) => cell === activeFilter));
  }, [report, activeFilter]);

  const exportRows = () => {
    const file = `${report.group}-${report.name}`.toLowerCase().replace(/\s+/g, '-');
    return { file, headers: report.headers, data: rows.map((row) => row.cells) };
  };

  return (
    <>
      <PageHeader title="Reports" subtitle="Each group uses the sample data already on screen. Downloads are sample files." />
      <Card styles={{ body: { padding: 16 } }} style={{ marginBottom: 16 }}>
        <Flex gap={12} wrap>
          <Select
            style={{ minWidth: 220 }}
            value={report.id}
            onChange={(value) => {
              setReportId(value);
              setFilter('All');
            }}
            options={['Employee', 'Attendance', 'Leave', 'Payroll', 'Recruitment', 'Probation', 'Documents', 'Offboarding']
              .map((group) => ({
                label: group,
                options: reports
                  .filter((item) => item.group === group)
                  .map((item) => ({ value: item.id, label: item.name })),
              }))
              .filter((group) => group.options.length)}
          />
          <Select
            style={{ minWidth: 180 }}
            value={activeFilter}
            onChange={setFilter}
            options={report.filters.map((value) => ({ value, label: value }))}
          />
          <Button
            onClick={() => {
              const file = exportRows();
              downloadCsv(`${file.file}.csv`, file.headers, file.data);
              message.success(`Sample CSV downloaded (${file.data.length} rows).`);
            }}
          >
            Export CSV
          </Button>
          <Button
            onClick={() => {
              const file = exportRows();
              downloadExcel(`${file.file}.xls`, file.headers, file.data);
              message.success(`Sample Excel downloaded (${file.data.length} rows).`);
            }}
          >
            Export Excel
          </Button>
          <Button
            onClick={() => {
              downloadPdf(`${report.group} ${report.name}`);
              message.success('Sample PDF downloaded.');
            }}
          >
            Export PDF
          </Button>
        </Flex>
      </Card>
      <Card styles={{ body: { padding: 16 } }}>
        <Table
          rowKey="key"
          pagination={false}
          dataSource={rows}
          columns={report.headers.map((title, index) => ({
            title,
            key: title,
            render: (_: unknown, row: ReportRow) => row.cells[index],
          }))}
        />
      </Card>
    </>
  );
}
