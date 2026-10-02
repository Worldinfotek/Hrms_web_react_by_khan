import { App, Button, Card, DatePicker, Form, Input, Select, Table, Tag, Typography } from 'antd';
import type { Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';
import { SHIFT_GENERAL } from '@/features/attendance/seed';
import { useAttendanceStore } from '@/features/attendance/store';
import { leaveDates, leaveDayCount } from '@/features/leave/logic';
import { balanceOf, useLeaveStore } from '@/features/leave/store';
import { remaining, type LeaveRequest } from '@/features/leave/types';
import { FormDrawer, PageHeader } from '@/shared/components';
import { formatDate } from '@/shared/utils/format';
import { EmployeeViewGate } from '../components/EmployeeViewGate';
import { ESS_EMPLOYEE } from '../types';

interface LeaveForm {
  leaveTypeId: string;
  range: [Dayjs, Dayjs];
  reason: string;
}

export default function EssLeavePage() {
  const { message } = App.useApp();
  const types = useLeaveStore((state) => state.types);
  const balances = useLeaveStore((state) => state.balances);
  const requests = useLeaveStore((state) => state.requests);
  const apply = useLeaveStore((state) => state.apply);
  const shifts = useAttendanceStore((state) => state.shifts);
  const holidays = useAttendanceStore((state) => state.holidays);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<LeaveForm>();
  const mine = useMemo(() => requests.filter((item) => item.employeeCode === ESS_EMPLOYEE.code), [requests]);
  const active = types.filter((type) => type.isActive);

  const submit = async () => {
    let values: LeaveForm;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    const weeklyOff = shifts.find((shift) => shift.id === SHIFT_GENERAL)?.weeklyOff ?? ['Saturday', 'Sunday'];
    const dates = leaveDates(
      values.range[0].format('YYYY-MM-DD'),
      values.range[1].format('YYYY-MM-DD'),
      false,
      weeklyOff,
      holidays.map((holiday) => holiday.date),
    );
    const error = apply({
      employeeCode: ESS_EMPLOYEE.code,
      employeeName: ESS_EMPLOYEE.name,
      department: ESS_EMPLOYEE.department,
      leaveTypeId: values.leaveTypeId,
      start: values.range[0].format('YYYY-MM-DD'),
      end: values.range[1].format('YYYY-MM-DD'),
      halfDay: false,
      days: leaveDayCount(dates, false),
      dates,
      reason: values.reason.trim(),
      attachmentName: null,
    });
    if (error) {
      message.error(error);
      return;
    }
    message.success('Leave requested. It is pending on the Leave screen.');
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="My leave"
        subtitle="Your balances only."
        actions={
          <Button
            type="primary"
            onClick={() => {
              form.resetFields();
              setOpen(true);
            }}
          >
            Apply
          </Button>
        }
      />
      <EmployeeViewGate>
        <Card styles={{ body: { padding: 16 } }} style={{ marginBottom: 16 }}>
          {active.map((type) => (
            <Typography.Text key={type.id} style={{ marginRight: 16 }}>
              {type.name}: {remaining(balanceOf(balances, ESS_EMPLOYEE.code, type))} left
            </Typography.Text>
          ))}
        </Card>
        <Card styles={{ body: { padding: 16 } }}>
          <Table<LeaveRequest>
            rowKey="id"
            dataSource={mine}
            pagination={false}
            columns={[
              { title: 'Type', dataIndex: 'leaveTypeId', render: (id: string) => types.find((type) => type.id === id)?.name ?? id },
              {
                title: 'Dates',
                key: 'dates',
                render: (_, row) => (row.start === row.end ? formatDate(row.start) : `${formatDate(row.start)} – ${formatDate(row.end)}`),
              },
              { title: 'Days', dataIndex: 'days', width: 80 },
              {
                title: 'Decision',
                dataIndex: 'decision',
                render: (value: LeaveRequest['decision']) => (
                  <Tag color={value === 'Approved' ? 'green' : value === 'Rejected' ? 'red' : 'gold'}>{value}</Tag>
                ),
              },
            ]}
          />
        </Card>
      </EmployeeViewGate>
      <FormDrawer open={open} title="Apply for leave" submitText="Submit" onClose={() => setOpen(false)} onSubmit={() => void submit()}>
        <Form form={form} layout="vertical">
          <Form.Item name="leaveTypeId" label="Type" rules={[{ required: true, message: 'Choose a type' }]}>
            <Select options={active.map((type) => ({ value: type.id, label: type.name }))} />
          </Form.Item>
          <Form.Item name="range" label="Dates" rules={[{ required: true, message: 'Choose the dates' }]}>
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reason" label="Reason" rules={[{ required: true, message: 'Enter a reason' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </FormDrawer>
    </>
  );
}
