import { App, Button, Card, Descriptions, Form, Input, Steps, Typography } from 'antd';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components';
import { formatDate } from '@/shared/utils/format';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { useRecruitmentStore } from '../store';

export default function ConvertPage() {
  const { message } = App.useApp();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const candidates = useRecruitmentStore((state) => state.candidates);
  const vacancies = useRecruitmentStore((state) => state.vacancies);
  const markConverted = useRecruitmentStore((state) => state.markConverted);
  const candidate = candidates.find((item) => item.id === id);
  const vacancy = vacancies.find((item) => item.id === candidate?.vacancyId);
  const [step, setStep] = useState(0);

  if (!candidate || !vacancy) {
    return (
      <>
        <PageHeader title="Convert to employee" />
        <Link to="/recruitment">Back to vacancies</Link>
      </>
    );
  }

  const finish = () => {
    markConverted(candidate.id);
    message.success('Wizard completed. No employee was added to the directory.');
    setStep(3);
  };

  return (
    <>
      <PageHeader
        title="Convert to employee"
        subtitle={`${candidate.name} · ${vacancy.title}`}
        actions={
          <Button onClick={() => navigate(`/recruitment/candidates/${candidate.id}`)}>Back to candidate</Button>
        }
      />
      <SampleDataNotice />
      <Card styles={{ body: { padding: 16 } }}>
        <Steps
          current={step}
          style={{ marginBottom: 24 }}
          items={[{ title: 'Person' }, { title: 'Job' }, { title: 'Review' }, { title: 'Done' }]}
        />
        {step === 0 && (
          <Form layout="vertical" initialValues={{ name: candidate.name, email: candidate.email, phone: candidate.phone }}>
            <Form.Item label="Full name" name="name">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Email" name="email">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Phone" name="phone">
              <Input disabled />
            </Form.Item>
            <Button type="primary" onClick={() => setStep(1)}>
              Next
            </Button>
          </Form>
        )}
        {step === 1 && (
          <Form
            layout="vertical"
            initialValues={{
              department: vacancy.department,
              designation: vacancy.designation,
              hiringManager: vacancy.hiringManager,
              joiningDate: candidate.offer ? formatDate(candidate.offer.joiningDate) : '',
            }}
          >
            <Form.Item label="Department" name="department">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Designation" name="designation">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Hiring manager" name="hiringManager">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Joining date" name="joiningDate">
              <Input disabled />
            </Form.Item>
            <Button onClick={() => setStep(0)} style={{ marginRight: 8 }}>
              Back
            </Button>
            <Button type="primary" onClick={() => setStep(2)}>
              Next
            </Button>
          </Form>
        )}
        {step === 2 && (
          <>
            <Descriptions bordered size="small" column={1} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Name">{candidate.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{candidate.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{candidate.phone}</Descriptions.Item>
              <Descriptions.Item label="Department">{vacancy.department}</Descriptions.Item>
              <Descriptions.Item label="Designation">{vacancy.designation}</Descriptions.Item>
              <Descriptions.Item label="Joining">
                {candidate.offer ? formatDate(candidate.offer.joiningDate) : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Salary">{candidate.offer?.salary ?? '—'}</Descriptions.Item>
            </Descriptions>
            <Typography.Paragraph>
              This wizard does not create an employee. The directory stays unchanged until the backend phase.
            </Typography.Paragraph>
            <Button onClick={() => setStep(1)} style={{ marginRight: 8 }}>
              Back
            </Button>
            <Button type="primary" onClick={finish}>
              Finish preview
            </Button>
          </>
        )}
        {step === 3 && (
          <>
            <Typography.Title level={4}>{candidate.name} is ready to convert later.</Typography.Title>
            <Typography.Paragraph>
              The Employees list was not changed. Open Employees and confirm {candidate.name} is not there.
            </Typography.Paragraph>
            <Button type="primary" onClick={() => navigate('/employees')}>
              Open employees
            </Button>
          </>
        )}
      </Card>
    </>
  );
}
