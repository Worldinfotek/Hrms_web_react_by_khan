import { App, Button, Card, DatePicker, Flex, Form, Input, Modal, Select, Table, Tag, Typography } from 'antd';
import type { TableProps } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useState } from 'react';
import { useEmployees } from '@/features/employees/api/employeesApi';
import { FormDrawer, PageHeader } from '@/shared/components';
import { formatDate } from '@/shared/utils/format';
import { AttendanceStatusTag } from '../components/AttendanceStatusTag';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { isDateLocked, useAttendanceStore } from '../store';
import { ATTENDANCE_STATUSES, type AttendanceStatus, type CorrectionRequest } from '../types';

interface CorrectionForm {
  employeeCode: string;
  date: Dayjs;
  toStatus: AttendanceStatus;
  reason: string;
}

export default function CorrectionsPage() {
  const { message } = App.useApp();
  const employees = useEmployees({ page: 1, pageSize: 100, sortBy: 'fullName', sortOrder: 'asc' });
  const days = useAttendanceStore((state) => state.days);
  const corrections = useAttendanceStore((state) => state.corrections);
  const requestCorrection = useAttendanceStore((state) => state.requestCorrection);
  const decideCorrection = useAttendanceStore((state) => state.decideCorrection);
  const [open, setOpen] = useState(false);
  const [decision, setDecision] = useState<{ id: string; approved: boolean } | null>(null);
  const [comment, setComment] = useState('');
  const [form] = Form.useForm<CorrectionForm>();

  const nameFor = (code: string) =>
    employees.data?.items.find((item) => item.employeeCode === code)?.fullName ??
    corrections.find((item) => item.employeeCode === code)?.employeeName ??
    code;

  const onSubmit = async () => {
    let values: CorrectionForm;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    const date = values.date.format('YYYY-MM-DD');
    const existing = days.find((day) => day.employeeCode === values.employeeCode && day.date === date);
    const error = requestCorrection({
      employeeCode: values.employeeCode,
      employeeName: nameFor(values.employeeCode),
      date,
      fromStatus: existing?.status ?? 'Absent',
      toStatus: values.toStatus,
      reason: values.reason.trim(),
    });
    if (error) {
      message.error(error);
      return;
    }
    message.success('Correction submitted.');
    setOpen(false);
  };

  const columns: TableProps<CorrectionRequest>['columns'] = [
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
    { title: 'Date', dataIndex: 'date', width: 130, render: (value: string) => formatDate(value) },
    {
      title: 'Change',
      key: 'change',
      render: (_, row) => (
        <span>
          <AttendanceStatusTag status={row.fromStatus} /> → <AttendanceStatusTag status={row.toStatus} />
        </span>
      ),
    },
    { title: 'Reason', dataIndex: 'reason' },
    {
      title: 'Decision',
      dataIndex: 'decision',
      width: 120,
      render: (value: CorrectionRequest['decision']) => (
        <Tag color={value === 'Approved' ? 'green' : value === 'Rejected' ? 'red' : 'gold'}>{value}</Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 180,
      render: (_, row) =>
        row.decision === 'Pending' ? (
          <Flex gap={8}>
            <Button size="small" type="primary" onClick={() => { setComment(''); setDecision({ id: row.id, approved: true }); }}>
              Approve
            </Button>
            <Button size="small" danger onClick={() => { setComment(''); setDecision({ id: row.id, approved: false }); }}>
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
        title="Correction requests"
        subtitle="A request is approved or rejected here. A locked payroll period cannot be changed."
        actions={
          <Button
            type="primary"
            onClick={() => {
              form.resetFields();
              form.setFieldsValue({ date: dayjs().subtract(1, 'day'), toStatus: 'Present' });
              setOpen(true);
            }}
          >
            New correction
          </Button>
        }
      />
      <SampleDataNotice />
      <Card styles={{ body: { padding: 16 } }}>
        <Table<CorrectionRequest> rowKey="id" columns={columns} dataSource={corrections} pagination={false} scroll={{ x: 'max-content' }} />
      </Card>
      <FormDrawer open={open} title="Request a correction" onClose={() => setOpen(false)} onSubmit={onSubmit} submitText="Submit">
        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item name="employeeCode" label="Employee" rules={[{ required: true, message: 'Choose an employee.' }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={(employees.data?.items ?? []).map((item) => ({
                value: item.employeeCode,
                label: `${item.fullName} (${item.employeeCode})`,
              }))}
            />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Choose a date.' }]}>
            <DatePicker style={{ width: '100%' }} format="DD MMM YYYY" />
          </Form.Item>
          <Form.Item name="toStatus" label="Correct status to" rules={[{ required: true, message: 'Choose a status.' }]}>
            <Select options={ATTENDANCE_STATUSES.map((status) => ({ value: status, label: status }))} />
          </Form.Item>
          <Form.Item name="reason" label="Reason" rules={[{ required: true, message: 'Enter a reason.' }]}>
            <Input.TextArea rows={3} maxLength={300} />
          </Form.Item>
          <Typography.Text type="secondary">
            {isDateLocked(dayjs().startOf('month').subtract(1, 'day').format('YYYY-MM-DD'))
              ? 'Days before this month are locked.'
              : ''}
          </Typography.Text>
        </Form>
      </FormDrawer>
      <Modal
        open={decision !== null}
        title={decision?.approved ? 'Approve correction' : 'Reject correction'}
        okText={decision?.approved ? 'Approve' : 'Reject'}
        okButtonProps={{ danger: decision ? !decision.approved : false }}
        onCancel={() => setDecision(null)}
        onOk={() => {
          if (!decision) return;
          const request = corrections.find((item) => item.id === decision.id);
          if (request && decision.approved && isDateLocked(request.date)) {
            message.error('This payroll period is locked and cannot be edited.');
            return;
          }
          decideCorrection(decision.id, decision.approved, comment.trim());
          message.success(decision.approved ? 'Correction approved. The day was updated.' : 'Correction rejected.');
          setDecision(null);
        }}
      >
        <Input.TextArea rows={3} placeholder="Comment" value={comment} onChange={(event) => setComment(event.target.value)} />
      </Modal>
    </>
  );
}
