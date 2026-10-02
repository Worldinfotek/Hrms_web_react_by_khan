import { App, Button, Card, DatePicker, Flex, Form, Input, Select, Switch, Table, Tag, Typography, Upload } from 'antd';
import type { TableProps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';
import { useEmployees } from '@/features/employees/api/employeesApi';
import { SHIFT_GENERAL } from '@/features/attendance/seed';
import { useAttendanceStore } from '@/features/attendance/store';
import { FormDrawer, PageHeader } from '@/shared/components';
import { formatDate } from '@/shared/utils/format';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { leaveDates, leaveDayCount } from '../logic';
import { balanceOf, useLeaveStore } from '../store';
import { remaining, type LeaveRequest } from '../types';

interface ApplyForm {
  employeeCode: string;
  leaveTypeId: string;
  range: [Dayjs, Dayjs];
  halfDay: boolean;
  reason: string;
}

const fallbackPeople = [
  { employeeCode: 'WIT-0002', fullName: 'Sana Tariq', department: 'Technology' },
  { employeeCode: 'WIT-0004', fullName: 'Bilal Ahmed', department: 'Finance' },
  { employeeCode: 'WIT-0007', fullName: 'Ali Raza', department: 'Technology' },
];

export default function LeaveRequestsPage() {
  const { message } = App.useApp();
  const employees = useEmployees({ page: 1, pageSize: 100, sortBy: 'fullName', sortOrder: 'asc' });
  const types = useLeaveStore((state) => state.types);
  const balances = useLeaveStore((state) => state.balances);
  const requests = useLeaveStore((state) => state.requests);
  const apply = useLeaveStore((state) => state.apply);
  const decide = useLeaveStore((state) => state.decide);
  const shifts = useAttendanceStore((state) => state.shifts);
  const holidays = useAttendanceStore((state) => state.holidays);
  const [open, setOpen] = useState(false);
  const [attachment, setAttachment] = useState<string | null>(null);
  const [decision, setDecision] = useState<{ id: string; approved: boolean } | null>(null);
  const [comment, setComment] = useState('');
  const [form] = Form.useForm<ApplyForm>();
  const watched = Form.useWatch([], form);

  const people = employees.data?.items ?? fallbackPeople;
  const weeklyOff = useMemo(
    () => shifts.find((shift) => shift.id === SHIFT_GENERAL)?.weeklyOff ?? ['Saturday', 'Sunday'],
    [shifts],
  );
  const holidayDates = useMemo(() => holidays.map((holiday) => holiday.date), [holidays]);
  const activeTypes = types.filter((type) => type.isActive);
  const selectedType = activeTypes.find((type) => type.id === watched?.leaveTypeId);
  const halfDay = Boolean(watched?.halfDay) && Boolean(selectedType?.halfDayAllowed);

  const preview = useMemo(() => {
    if (!watched?.range?.[0] || !watched?.range?.[1]) return { dates: [] as string[], days: 0 };
    const dates = leaveDates(
      watched.range[0].format('YYYY-MM-DD'),
      watched.range[1].format('YYYY-MM-DD'),
      halfDay,
      weeklyOff,
      holidayDates,
    );
    return { dates, days: leaveDayCount(dates, halfDay) };
  }, [watched, halfDay, weeklyOff, holidayDates]);

  const previewBalance = selectedType && watched?.employeeCode ? balanceOf(balances, watched.employeeCode, selectedType) : null;

  const onSubmit = async () => {
    let values: ApplyForm;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    const person = people.find((item) => item.employeeCode === values.employeeCode);
    const error = apply({
      employeeCode: values.employeeCode,
      employeeName: person?.fullName ?? values.employeeCode,
      department: person?.department ?? '',
      leaveTypeId: values.leaveTypeId,
      start: values.range[0].format('YYYY-MM-DD'),
      end: values.range[1].format('YYYY-MM-DD'),
      halfDay,
      days: preview.days,
      dates: preview.dates,
      reason: values.reason.trim(),
      attachmentName: attachment,
    });
    if (error) {
      message.error(error);
      return;
    }
    message.success('Leave request submitted. Balance changes only after approval.');
    setOpen(false);
  };

  const columns: TableProps<LeaveRequest>['columns'] = [
    {
      title: 'Employee',
      dataIndex: 'employeeName',
      render: (name: string, row) => (
        <div>
          <div>{name}</div>
          <Typography.Text type="secondary">{row.employeeCode}</Typography.Text>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'leaveTypeId',
      width: 110,
      render: (id: string) => types.find((type) => type.id === id)?.name ?? id,
    },
    {
      title: 'Dates',
      key: 'dates',
      render: (_, row) =>
        row.start === row.end ? formatDate(row.start) : `${formatDate(row.start)} – ${formatDate(row.end)}`,
    },
    { title: 'Days', dataIndex: 'days', width: 80 },
    { title: 'Reason', dataIndex: 'reason' },
    {
      title: 'Decision',
      dataIndex: 'decision',
      width: 120,
      render: (value: LeaveRequest['decision']) => <DecisionTag value={value} />,
    },
    {
      title: '',
      key: 'actions',
      width: 180,
      render: (_, row) =>
        row.decision === 'Pending' ? (
          <Flex gap={8}>
            <Button
              size="small"
              type="primary"
              onClick={() => {
                setComment('');
                setDecision({ id: row.id, approved: true });
              }}
            >
              Approve
            </Button>
            <Button
              size="small"
              danger
              onClick={() => {
                setComment('');
                setDecision({ id: row.id, approved: false });
              }}
            >
              Reject
            </Button>
          </Flex>
        ) : (
          <Typography.Text type="secondary">{row.comment || '—'}</Typography.Text>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Leave requests"
        subtitle="Apply for leave. The balance drops only when the request is approved."
        actions={
          <Button
            type="primary"
            onClick={() => {
              setAttachment(null);
              form.resetFields();
              setOpen(true);
            }}
          >
            Apply
          </Button>
        }
      />
      <SampleDataNotice />
      <Card styles={{ body: { padding: 16 } }}>
        <Table<LeaveRequest> rowKey="id" columns={columns} dataSource={requests} pagination={{ pageSize: 8 }} />
      </Card>
      <FormDrawer
        open={open}
        title="Apply for leave"
        submitText="Submit"
        onClose={() => setOpen(false)}
        onSubmit={() => void onSubmit()}
      >
        <Form form={form} layout="vertical" initialValues={{ halfDay: false }}>
          <Form.Item name="employeeCode" label="Employee" rules={[{ required: true, message: 'Choose an employee' }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={people.map((item) => ({
                value: item.employeeCode,
                label: `${item.fullName} (${item.employeeCode})`,
              }))}
            />
          </Form.Item>
          <Form.Item name="leaveTypeId" label="Leave type" rules={[{ required: true, message: 'Choose a type' }]}>
            <Select options={activeTypes.map((type) => ({ value: type.id, label: type.name }))} />
          </Form.Item>
          <Form.Item name="range" label="Dates" rules={[{ required: true, message: 'Choose the dates' }]}>
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="halfDay" label="Half day" valuePropName="checked">
            <Switch disabled={!selectedType?.halfDayAllowed} />
          </Form.Item>
          <Typography.Paragraph type="secondary">
            Working days: {preview.days}
            {previewBalance && selectedType
              ? ` · Remaining ${selectedType.name}: ${remaining(previewBalance)}`
              : ''}
          </Typography.Paragraph>
          <Form.Item name="reason" label="Reason" rules={[{ required: true, message: 'Enter a reason' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Attachment" extra={selectedType?.attachmentAfterDays ? `Required after ${selectedType.attachmentAfterDays} days for ${selectedType.name}.` : 'Optional'}>
            <Upload
              maxCount={1}
              beforeUpload={(file) => {
                setAttachment(file.name);
                return false;
              }}
              onRemove={() => {
                setAttachment(null);
              }}
            >
              <Button icon={<UploadOutlined />}>Attach file</Button>
            </Upload>
          </Form.Item>
        </Form>
      </FormDrawer>
      <AppModal
        open={decision !== null}
        approved={decision?.approved ?? false}
        comment={comment}
        onComment={setComment}
        onCancel={() => setDecision(null)}
        onOk={() => {
          if (!decision) return;
          decide(decision.id, decision.approved, comment.trim());
          message.success(decision.approved ? 'Approved. Balance and attendance were updated.' : 'Rejected. Balance was not changed.');
          setDecision(null);
        }}
      />
    </>
  );
}

function DecisionTag({ value }: { value: LeaveRequest['decision'] }) {
  const color = value === 'Approved' ? 'green' : value === 'Rejected' ? 'red' : 'gold';
  return <Tag color={color}>{value}</Tag>;
}

function AppModal({
  open,
  approved,
  comment,
  onComment,
  onCancel,
  onOk,
}: {
  open: boolean;
  approved: boolean;
  comment: string;
  onComment: (value: string) => void;
  onCancel: () => void;
  onOk: () => void;
}) {
  return (
    <FormDrawer open={open} title={approved ? 'Approve leave' : 'Reject leave'} submitText={approved ? 'Approve' : 'Reject'} onClose={onCancel} onSubmit={onOk}>
      <Input.TextArea rows={3} placeholder="Comment" value={comment} onChange={(event) => onComment(event.target.value)} />
    </FormDrawer>
  );
}
