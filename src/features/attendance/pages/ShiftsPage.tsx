import { CheckCircleOutlined, EditOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons';
import { App, Button, Card, Flex, Form, Input, InputNumber, Select, Switch, Table, Tag, TimePicker, Tooltip, Typography } from 'antd';
import type { TableProps } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { ConfirmAction, FormDrawer, PageHeader } from '@/shared/components';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { useAttendanceStore } from '../store';
import { WEEK_DAYS, type Shift } from '../types';

interface ShiftForm {
  name: string;
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
  breakMinutes: number;
  graceMinutes: number;
  lateAfterMinutes: number;
  earlyLeaveMinutes: number;
  halfDayHours: number;
  weeklyOff: string[];
  isActive: boolean;
}

const toTime = (value: string) => dayjs(value, 'HH:mm');

export default function ShiftsPage() {
  const { message } = App.useApp();
  const shifts = useAttendanceStore((state) => state.shifts);
  const saveShift = useAttendanceStore((state) => state.saveShift);
  const setShiftActive = useAttendanceStore((state) => state.setShiftActive);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Shift | null>(null);
  const [form] = Form.useForm<ShiftForm>();

  const startCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      start: toTime('09:00'),
      end: toTime('18:00'),
      breakMinutes: 60,
      graceMinutes: 15,
      lateAfterMinutes: 15,
      earlyLeaveMinutes: 15,
      halfDayHours: 4,
      weeklyOff: ['Saturday', 'Sunday'],
      isActive: true,
    });
    setOpen(true);
  };

  const startEdit = (shift: Shift) => {
    setEditing(shift);
    form.setFieldsValue({
      ...shift,
      start: toTime(shift.start),
      end: toTime(shift.end),
    });
    setOpen(true);
  };

  const onSubmit = async () => {
    let values: ShiftForm;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    saveShift({
      id: editing?.id ?? crypto.randomUUID(),
      name: values.name.trim(),
      start: values.start.format('HH:mm'),
      end: values.end.format('HH:mm'),
      breakMinutes: values.breakMinutes,
      graceMinutes: values.graceMinutes,
      lateAfterMinutes: values.lateAfterMinutes,
      earlyLeaveMinutes: values.earlyLeaveMinutes,
      halfDayHours: values.halfDayHours,
      weeklyOff: values.weeklyOff,
      isActive: values.isActive,
    });
    message.success(editing ? 'Shift updated.' : 'Shift added.');
    setOpen(false);
  };

  const columns: TableProps<Shift>['columns'] = [
    {
      title: 'Shift',
      dataIndex: 'name',
      render: (name: string, shift) => (
        <div>
          <div>{name}</div>
          <Typography.Text type="secondary">
            {shift.start} – {shift.end} · break {shift.breakMinutes} min
          </Typography.Text>
        </div>
      ),
    },
    {
      title: 'Grace / late',
      key: 'grace',
      width: 140,
      render: (_, shift) => `${shift.graceMinutes} / ${shift.lateAfterMinutes} min`,
    },
    {
      title: 'Weekly off',
      dataIndex: 'weeklyOff',
      render: (days: string[]) => days.join(', '),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      width: 110,
      render: (active: boolean) => <Tag color={active ? 'green' : 'default'}>{active ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      render: (_, shift) => (
        <Flex gap={4} justify="flex-end">
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} aria-label={`Edit ${shift.name}`} onClick={() => startEdit(shift)} />
          </Tooltip>
          <ConfirmAction
            title={`${shift.isActive ? 'Deactivate' : 'Activate'} "${shift.name}"?`}
            danger={shift.isActive}
            onConfirm={() => setShiftActive(shift.id, !shift.isActive)}
          >
            <Tooltip title={shift.isActive ? 'Deactivate' : 'Activate'}>
              <Button
                type="text"
                aria-label={shift.isActive ? `Deactivate ${shift.name}` : `Activate ${shift.name}`}
                icon={shift.isActive ? <StopOutlined /> : <CheckCircleOutlined style={{ color: '#52c41a' }} />}
              />
            </Tooltip>
          </ConfirmAction>
        </Flex>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Shifts"
        subtitle="Start, end, break, grace, and weekly off used when attendance is calculated"
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={startCreate}>
            Add shift
          </Button>
        }
      />
      <SampleDataNotice />
      <Card styles={{ body: { padding: 16 } }}>
        <Table<Shift> rowKey="id" columns={columns} dataSource={shifts} pagination={false} scroll={{ x: 'max-content' }} />
      </Card>
      <FormDrawer open={open} title={editing ? 'Edit shift' : 'Add shift'} onClose={() => setOpen(false)} onSubmit={onSubmit}>
        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Enter a shift name.' }]}>
            <Input placeholder="General" maxLength={60} />
          </Form.Item>
          <Form.Item name="start" label="Start" rules={[{ required: true, message: 'Choose a start time.' }]}>
            <TimePicker format="HH:mm" minuteStep={5} style={{ width: '100%' }} needConfirm={false} />
          </Form.Item>
          <Form.Item name="end" label="End" rules={[{ required: true, message: 'Choose an end time.' }]}>
            <TimePicker format="HH:mm" minuteStep={5} style={{ width: '100%' }} needConfirm={false} />
          </Form.Item>
          <Form.Item name="breakMinutes" label="Break (minutes)" rules={[{ required: true, message: 'Enter the break.' }]}>
            <InputNumber min={0} max={180} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="graceMinutes" label="Grace period (minutes)" rules={[{ required: true, message: 'Enter the grace period.' }]}>
            <InputNumber min={0} max={60} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="lateAfterMinutes" label="Late after (minutes)" rules={[{ required: true, message: 'Enter the late threshold.' }]}>
            <InputNumber min={0} max={120} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="earlyLeaveMinutes" label="Early leave (minutes)" rules={[{ required: true, message: 'Enter the early-leave threshold.' }]}>
            <InputNumber min={0} max={120} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="halfDayHours" label="Half day (hours)" rules={[{ required: true, message: 'Enter the half-day hours.' }]}>
            <InputNumber min={1} max={8} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="weeklyOff" label="Weekly off" rules={[{ required: true, message: 'Choose at least one weekly off day.' }]}>
            <Select mode="multiple" options={WEEK_DAYS.map((day) => ({ value: day, label: day }))} />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </FormDrawer>
    </>
  );
}
