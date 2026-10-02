import { App, Button, DatePicker, Form, Input } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { EmployeeViewGate } from '@/features/ess/components/EmployeeViewGate';
import { ESS_EMPLOYEE } from '@/features/ess/types';
import { PageHeader } from '@/shared/components';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { useOffboardingStore } from '../store';

export default function ResignationPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const startExit = useOffboardingStore((state) => state.startExit);
  const [form] = Form.useForm<{ lastWorkingDay: dayjs.Dayjs; reason: string }>();

  const submit = async () => {
    const values = await form.validateFields();
    const error = startExit({
      employeeCode: ESS_EMPLOYEE.code,
      employeeName: ESS_EMPLOYEE.name,
      department: ESS_EMPLOYEE.department,
      kind: 'Resignation',
      reason: values.reason.trim(),
      lastWorkingDay: values.lastWorkingDay.format('YYYY-MM-DD'),
    });
    if (error) {
      message.error(error);
      return;
    }
    message.success('Resignation submitted. It is on the Offboarding screen.');
    navigate('/offboarding');
  };

  return (
    <>
      <PageHeader title="Resign" subtitle="Last working day and reason. This does not change the employee directory." />
      <SampleDataNotice />
      <EmployeeViewGate>
        <Form form={form} layout="vertical" style={{ maxWidth: 480 }} onFinish={() => void submit()}>
          <Form.Item name="lastWorkingDay" label="Last working day" rules={[{ required: true, message: 'Choose a date' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reason" label="Reason" rules={[{ required: true, message: 'Enter a reason' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Submit resignation
          </Button>
        </Form>
      </EmployeeViewGate>
    </>
  );
}
