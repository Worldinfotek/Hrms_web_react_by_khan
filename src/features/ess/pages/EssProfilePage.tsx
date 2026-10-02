import { App, Button, Card, Descriptions, Form, Input, Table, Tag } from 'antd';
import { useState } from 'react';
import { FormDrawer, PageHeader } from '@/shared/components';
import { EmployeeViewGate } from '../components/EmployeeViewGate';
import { useEssStore } from '../store';
import { ESS_EMPLOYEE, type ProfileChange } from '../types';

export default function EssProfilePage() {
  const { message } = App.useApp();
  const changes = useEssStore((state) => state.changes);
  const requestChange = useEssStore((state) => state.requestChange);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<{ field: string; value: string; reason: string }>();

  const submit = async () => {
    let values: { field: string; value: string; reason: string };
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    requestChange(values.field.trim(), values.value.trim(), values.reason.trim());
    message.success('Profile change requested. It is not written to the employee record.');
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="My profile"
        subtitle="Fields you are allowed to see. A change is a request, not an edit of the directory."
        actions={
          <Button
            type="primary"
            onClick={() => {
              form.resetFields();
              form.setFieldsValue({ field: 'Mobile number' });
              setOpen(true);
            }}
          >
            Request a change
          </Button>
        }
      />
      <EmployeeViewGate>
        <Card styles={{ body: { padding: 16 } }} style={{ marginBottom: 16 }}>
          <Descriptions column={{ xs: 1, md: 2 }} size="small" bordered>
            <Descriptions.Item label="Name">{ESS_EMPLOYEE.name}</Descriptions.Item>
            <Descriptions.Item label="Code">{ESS_EMPLOYEE.code}</Descriptions.Item>
            <Descriptions.Item label="Email">{ESS_EMPLOYEE.email}</Descriptions.Item>
            <Descriptions.Item label="Mobile">{ESS_EMPLOYEE.phone}</Descriptions.Item>
            <Descriptions.Item label="Department">{ESS_EMPLOYEE.department}</Descriptions.Item>
            <Descriptions.Item label="Designation">{ESS_EMPLOYEE.designation}</Descriptions.Item>
            <Descriptions.Item label="Reports to">{ESS_EMPLOYEE.manager}</Descriptions.Item>
          </Descriptions>
        </Card>
        <Card title="Change requests" styles={{ body: { padding: 16 } }}>
          <Table<ProfileChange>
            rowKey="id"
            pagination={false}
            dataSource={changes}
            columns={[
              { title: 'Field', dataIndex: 'field' },
              { title: 'New value', dataIndex: 'value' },
              { title: 'Reason', dataIndex: 'reason' },
              { title: 'Status', dataIndex: 'status', render: (value: string) => <Tag>{value}</Tag> },
            ]}
          />
        </Card>
      </EmployeeViewGate>
      <FormDrawer open={open} title="Request a profile change" onClose={() => setOpen(false)} onSubmit={() => void submit()}>
        <Form form={form} layout="vertical">
          <Form.Item name="field" label="Field" rules={[{ required: true, message: 'Enter the field' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="value" label="New value" rules={[{ required: true, message: 'Enter the new value' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="reason" label="Reason" rules={[{ required: true, message: 'Enter a reason' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </FormDrawer>
    </>
  );
}
