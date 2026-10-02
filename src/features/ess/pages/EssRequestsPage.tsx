import { App, Button, Card, Form, Input, Select, Table, Tag } from 'antd';
import { useState } from 'react';
import { FormDrawer, PageHeader } from '@/shared/components';
import { EmployeeViewGate } from '../components/EmployeeViewGate';
import { useEssStore } from '../store';
import type { HrRequest, HrRequestKind } from '../types';

const KINDS: HrRequestKind[] = ['Experience letter', 'Salary certificate', 'General request'];

export default function EssRequestsPage() {
  const { message } = App.useApp();
  const requests = useEssStore((state) => state.requests);
  const sendRequest = useEssStore((state) => state.sendRequest);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<{ kind: HrRequestKind; detail: string }>();

  const submit = async () => {
    let values: { kind: HrRequestKind; detail: string };
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    sendRequest(values.kind, values.detail.trim());
    message.success('Request sent. It appears in the manager inbox.');
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="HR requests"
        subtitle="Experience letter, salary certificate, or a general request."
        actions={
          <Button
            type="primary"
            onClick={() => {
              form.resetFields();
              setOpen(true);
            }}
          >
            New request
          </Button>
        }
      />
      <EmployeeViewGate>
        <Card styles={{ body: { padding: 16 } }}>
          <Table<HrRequest>
            rowKey="id"
            pagination={false}
            dataSource={requests}
            columns={[
              { title: 'Type', dataIndex: 'kind' },
              { title: 'Detail', dataIndex: 'detail' },
              {
                title: 'Status',
                dataIndex: 'status',
                render: (value: HrRequest['status']) => (
                  <Tag color={value === 'Approved' ? 'green' : value === 'Rejected' ? 'red' : 'gold'}>{value}</Tag>
                ),
              },
            ]}
          />
        </Card>
      </EmployeeViewGate>
      <FormDrawer open={open} title="New HR request" submitText="Send" onClose={() => setOpen(false)} onSubmit={() => void submit()}>
        <Form form={form} layout="vertical">
          <Form.Item name="kind" label="Type" rules={[{ required: true, message: 'Choose a type' }]}>
            <Select options={KINDS.map((value) => ({ value, label: value }))} />
          </Form.Item>
          <Form.Item name="detail" label="Detail" rules={[{ required: true, message: 'Enter the detail' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </FormDrawer>
    </>
  );
}
