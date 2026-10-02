import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Card, DatePicker, Form, Input, Table, Tooltip } from 'antd';
import type { TableProps } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { ConfirmAction, FormDrawer, PageHeader } from '@/shared/components';
import { formatDate } from '@/shared/utils/format';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { useAttendanceStore } from '../store';
import type { Holiday } from '../types';

export default function HolidaysPage() {
  const { message } = App.useApp();
  const holidays = useAttendanceStore((state) => state.holidays);
  const addHoliday = useAttendanceStore((state) => state.addHoliday);
  const removeHoliday = useAttendanceStore((state) => state.removeHoliday);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<{ name: string; date: dayjs.Dayjs }>();

  const columns: TableProps<Holiday>['columns'] = [
    { title: 'Holiday', dataIndex: 'name' },
    { title: 'Date', dataIndex: 'date', render: (value: string) => formatDate(value) },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_, holiday) => (
        <ConfirmAction title={`Remove "${holiday.name}"?`} onConfirm={() => removeHoliday(holiday.id)}>
          <Tooltip title="Remove">
            <Button type="text" danger icon={<DeleteOutlined />} aria-label={`Remove ${holiday.name}`} />
          </Tooltip>
        </ConfirmAction>
      ),
    },
  ];

  const onSubmit = async () => {
    let values: { name: string; date: dayjs.Dayjs };
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    addHoliday({ id: crypto.randomUUID(), name: values.name.trim(), date: values.date.format('YYYY-MM-DD') });
    message.success('Holiday added.');
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Holidays"
        subtitle="Public holidays for this company. Attendance and leave both use this calendar."
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setOpen(true);
            }}
          >
            Add holiday
          </Button>
        }
      />
      <SampleDataNotice />
      <Card styles={{ body: { padding: 16 } }}>
        <Table<Holiday> rowKey="id" columns={columns} dataSource={holidays} pagination={false} />
      </Card>
      <FormDrawer open={open} title="Add holiday" onClose={() => setOpen(false)} onSubmit={onSubmit}>
        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Enter a holiday name.' }]}>
            <Input placeholder="Public holiday" maxLength={80} />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Choose a date.' }]}>
            <DatePicker style={{ width: '100%' }} format="DD MMM YYYY" />
          </Form.Item>
        </Form>
      </FormDrawer>
    </>
  );
}
