import { App, Button, Card, DatePicker, Form, Input, Select, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormDrawer, PageHeader } from '@/shared/components';
import { formatDate } from '@/shared/utils/format';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { ROSTER } from '../roster';
import { useOffboardingStore } from '../store';
import { exitStage, type ExitCase, type ExitKind } from '../types';

const KINDS: ExitKind[] = ['Termination', 'Non-confirmation'];

export default function ExitTrackerPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const cases = useOffboardingStore((state) => state.cases);
  const startExit = useOffboardingStore((state) => state.startExit);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<{ employeeCode: string; kind: ExitKind; reason: string; lastWorkingDay: dayjs.Dayjs }>();
  const rows = useMemo(() => cases.map((item) => ({ ...item, stage: exitStage(item) })), [cases]);
  const available = ROSTER.filter((person) => !cases.some((item) => item.employeeCode === person.code));

  const submit = async () => {
    const values = await form.validateFields();
    const person = ROSTER.find((item) => item.code === values.employeeCode);
    if (!person) return;
    const error = startExit({
      employeeCode: person.code,
      employeeName: person.name,
      department: person.department,
      kind: values.kind,
      reason: values.reason.trim(),
      lastWorkingDay: values.lastWorkingDay.format('YYYY-MM-DD'),
    });
    if (error) {
      message.error(error);
      return;
    }
    message.success('HR exit started in this browser.');
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Offboarding"
        subtitle="One resignation is in clearance. One exit is complete."
        actions={
          <Button
            type="primary"
            onClick={() => {
              form.resetFields();
              setOpen(true);
            }}
          >
            Start HR exit
          </Button>
        }
      />
      <SampleDataNotice />
      <Card styles={{ body: { padding: 16 } }}>
        <Table<(typeof rows)[number]>
          rowKey="id"
          pagination={false}
          dataSource={rows}
          columns={[
            { title: 'Employee', dataIndex: 'employeeName' },
            { title: 'Kind', dataIndex: 'kind', width: 160 },
            {
              title: 'Last working day',
              dataIndex: 'lastWorkingDay',
              width: 160,
              render: (value: string) => formatDate(value),
            },
            {
              title: 'Stage',
              dataIndex: 'stage',
              width: 160,
              render: (value: string) => <Tag color={value === 'Completed' ? 'default' : 'gold'}>{value}</Tag>,
            },
            {
              title: '',
              key: 'open',
              width: 90,
              render: (_, row: ExitCase) => (
                <Button type="link" onClick={() => navigate(`/offboarding/${row.id}`)}>
                  Open
                </Button>
              ),
            },
          ]}
        />
      </Card>
      <FormDrawer open={open} title="HR-initiated exit" onClose={() => setOpen(false)} onSubmit={() => void submit()}>
        <Form form={form} layout="vertical">
          <Form.Item name="employeeCode" label="Employee" rules={[{ required: true, message: 'Choose a person' }]}>
            <Select options={available.map((person) => ({ value: person.code, label: `${person.name} (${person.code})` }))} />
          </Form.Item>
          <Form.Item name="kind" label="Kind" rules={[{ required: true, message: 'Choose a kind' }]}>
            <Select options={KINDS.map((value) => ({ value, label: value }))} />
          </Form.Item>
          <Form.Item name="lastWorkingDay" label="Last working day" rules={[{ required: true, message: 'Choose a date' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reason" label="Reason" rules={[{ required: true, message: 'Enter a reason' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </FormDrawer>
    </>
  );
}
