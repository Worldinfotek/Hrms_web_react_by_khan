import { Button, Card, Form, Input, InputNumber, Select, Switch, Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import { useState } from 'react';
import { FormDrawer, PageHeader } from '@/shared/components';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { useLeaveStore } from '../store';
import type { LeaveType } from '../types';

interface TypeForm {
  name: string;
  paid: boolean;
  halfDayAllowed: boolean;
  carryForward: boolean;
  accrual: LeaveType['accrual'];
  entitlement: number;
  attachmentAfterDays: number | null;
  isActive: boolean;
}

export default function LeaveTypesPage() {
  const types = useLeaveStore((state) => state.types);
  const saveType = useLeaveStore((state) => state.saveType);
  const [editing, setEditing] = useState<LeaveType | 'new' | null>(null);
  const [form] = Form.useForm<TypeForm>();

  const open = (type: LeaveType | 'new') => {
    if (type === 'new') {
      form.setFieldsValue({
        name: '',
        paid: true,
        halfDayAllowed: false,
        carryForward: false,
        accrual: 'Yearly',
        entitlement: 0,
        attachmentAfterDays: null,
        isActive: true,
      });
    } else {
      form.setFieldsValue(type);
    }
    setEditing(type);
  };

  const onSubmit = async () => {
    let values: TypeForm;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    const id = editing && editing !== 'new' ? editing.id : crypto.randomUUID();
    saveType({
      id,
      name: values.name.trim(),
      paid: values.paid,
      halfDayAllowed: values.halfDayAllowed,
      carryForward: values.carryForward,
      accrual: values.accrual,
      entitlement: values.entitlement,
      attachmentAfterDays: values.attachmentAfterDays || null,
      isActive: values.isActive,
    });
    setEditing(null);
  };

  const columns: TableProps<LeaveType>['columns'] = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Paid', dataIndex: 'paid', width: 80, render: (value: boolean) => (value ? 'Yes' : 'No') },
    { title: 'Entitlement', dataIndex: 'entitlement', width: 120 },
    { title: 'Accrual', dataIndex: 'accrual', width: 110 },
    {
      title: 'Half day',
      dataIndex: 'halfDayAllowed',
      width: 100,
      render: (value: boolean) => (value ? 'Yes' : 'No'),
    },
    {
      title: 'Carry forward',
      dataIndex: 'carryForward',
      width: 130,
      render: (value: boolean) => (value ? 'Yes' : 'No'),
    },
    {
      title: 'Attachment after',
      dataIndex: 'attachmentAfterDays',
      width: 150,
      render: (value: number | null) => (value ? `${value} days` : '—'),
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      width: 90,
      render: (value: boolean) => <Tag color={value ? 'green' : 'default'}>{value ? 'Active' : 'Off'}</Tag>,
    },
    {
      title: '',
      key: 'edit',
      width: 80,
      render: (_, row) => (
        <Button size="small" onClick={() => open(row)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Leave types"
        subtitle="Annual, casual, sick, and unpaid. Entitlement is the yearly allocation."
        actions={
          <Button type="primary" onClick={() => open('new')}>
            Add type
          </Button>
        }
      />
      <SampleDataNotice />
      <Card styles={{ body: { padding: 16 } }}>
        <Table<LeaveType> rowKey="id" columns={columns} dataSource={types} pagination={false} />
      </Card>
      <FormDrawer
        open={editing !== null}
        title={editing === 'new' ? 'Add leave type' : 'Edit leave type'}
        onClose={() => setEditing(null)}
        onSubmit={() => void onSubmit()}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Enter a name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="entitlement" label="Yearly entitlement (days)" rules={[{ required: true, message: 'Enter the entitlement' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="accrual" label="Accrual" rules={[{ required: true }]}>
            <Select options={[{ value: 'Yearly', label: 'Yearly' }, { value: 'Monthly', label: 'Monthly' }]} />
          </Form.Item>
          <Form.Item name="attachmentAfterDays" label="Ask for an attachment after (days)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="paid" label="Paid" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="halfDayAllowed" label="Half day allowed" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="carryForward" label="Carry forward" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </FormDrawer>
    </>
  );
}
