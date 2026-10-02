import { App, Button, Card, Form, Input, Switch } from 'antd';
import { PageHeader } from '@/shared/components';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { useAttendanceStore } from '../store';
import type { AttendancePolicy } from '../types';

export default function AttendancePolicyPage() {
  const { message } = App.useApp();
  const policy = useAttendanceStore((state) => state.policy);
  const savePolicy = useAttendanceStore((state) => state.savePolicy);
  const [form] = Form.useForm<AttendancePolicy>();

  return (
    <>
      <PageHeader title="Attendance policy" subtitle="Short rules shown to HR. The shift still holds grace, late, and half-day numbers." />
      <SampleDataNotice />
      <Card styles={{ body: { padding: 16 } }} style={{ maxWidth: 720 }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={policy}
          onFinish={(values) => {
            savePolicy(values);
            message.success('Attendance policy saved in this browser.');
          }}
        >
          <Form.Item name="latePolicy" label="Late policy" rules={[{ required: true, message: 'Enter the late policy.' }]}>
            <Input.TextArea rows={2} maxLength={240} />
          </Form.Item>
          <Form.Item name="overtimePolicy" label="Overtime" rules={[{ required: true, message: 'Enter the overtime rule.' }]}>
            <Input.TextArea rows={2} maxLength={240} />
          </Form.Item>
          <Form.Item name="webCheckIn" label="Web check-in" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Save policy
          </Button>
        </Form>
      </Card>
    </>
  );
}
