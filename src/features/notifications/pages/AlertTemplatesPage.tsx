import { App, Button, Card, Form, Input, InputNumber, Select, Table } from 'antd';
import { useState } from 'react';
import { FormDrawer, PageHeader } from '@/shared/components';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { useNotificationStore } from '../store';
import type { AlertTemplate, Reminder, ReminderRecipient } from '../types';

const RECIPIENTS: ReminderRecipient[] = ['HR', 'Manager', 'Employee', 'Finance'];

export default function AlertTemplatesPage() {
  const { message } = App.useApp();
  const templates = useNotificationStore((state) => state.templates);
  const reminders = useNotificationStore((state) => state.reminders);
  const saveTemplate = useNotificationStore((state) => state.saveTemplate);
  const saveReminder = useNotificationStore((state) => state.saveReminder);
  const [template, setTemplate] = useState<AlertTemplate | null>(null);
  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [templateForm] = Form.useForm<Pick<AlertTemplate, 'subject' | 'body'>>();
  const [reminderForm] = Form.useForm<Pick<Reminder, 'daysBefore' | 'recipient'>>();

  const saveTemplateForm = async () => {
    if (!template) return;
    const values = await templateForm.validateFields();
    saveTemplate({ ...template, subject: values.subject.trim(), body: values.body.trim() });
    message.success('Template saved in this browser.');
    setTemplate(null);
  };

  const saveReminderForm = async () => {
    if (!reminder) return;
    const values = await reminderForm.validateFields();
    saveReminder({ ...reminder, daysBefore: values.daysBefore, recipient: values.recipient });
    message.success('Reminder saved in this browser.');
    setReminder(null);
  };

  return (
    <>
      <PageHeader title="Alert templates" subtitle="Sample messages and how many days before an event the reminder fires." />
      <SampleDataNotice />
      <Card title="Templates" styles={{ body: { padding: 16 } }} style={{ marginBottom: 16 }}>
        <Table<AlertTemplate>
          rowKey="id"
          pagination={false}
          dataSource={templates}
          columns={[
            { title: 'Event', dataIndex: 'event', width: 200 },
            { title: 'Subject', dataIndex: 'subject' },
            {
              title: '',
              key: 'edit',
              width: 90,
              render: (_, row) => (
                <Button
                  type="link"
                  onClick={() => {
                    setTemplate(row);
                    templateForm.setFieldsValue({ subject: row.subject, body: row.body });
                  }}
                >
                  Edit
                </Button>
              ),
            },
          ]}
        />
      </Card>
      <Card title="Reminders" styles={{ body: { padding: 16 } }}>
        <Table<Reminder>
          rowKey="id"
          pagination={false}
          dataSource={reminders}
          columns={[
            { title: 'Event', dataIndex: 'event' },
            { title: 'Days before', dataIndex: 'daysBefore', width: 140 },
            { title: 'Recipient', dataIndex: 'recipient', width: 140 },
            {
              title: '',
              key: 'edit',
              width: 90,
              render: (_, row) => (
                <Button
                  type="link"
                  onClick={() => {
                    setReminder(row);
                    reminderForm.setFieldsValue({ daysBefore: row.daysBefore, recipient: row.recipient });
                  }}
                >
                  Edit
                </Button>
              ),
            },
          ]}
        />
      </Card>
      <FormDrawer open={template !== null} title="Edit template" onClose={() => setTemplate(null)} onSubmit={() => void saveTemplateForm()}>
        <Form form={templateForm} layout="vertical">
          <Form.Item name="subject" label="Subject" rules={[{ required: true, message: 'Enter a subject' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="body" label="Message" rules={[{ required: true, message: 'Enter a message' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </FormDrawer>
      <FormDrawer open={reminder !== null} title="Edit reminder" onClose={() => setReminder(null)} onSubmit={() => void saveReminderForm()}>
        <Form form={reminderForm} layout="vertical">
          <Form.Item name="daysBefore" label="Days before" rules={[{ required: true, message: 'Enter the days' }]}>
            <InputNumber min={0} max={90} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="recipient" label="Recipient" rules={[{ required: true, message: 'Choose a recipient' }]}>
            <Select options={RECIPIENTS.map((value) => ({ value, label: value }))} />
          </Form.Item>
        </Form>
      </FormDrawer>
    </>
  );
}
