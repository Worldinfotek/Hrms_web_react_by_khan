import { ArrowLeftOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, DatePicker, Descriptions, Flex, Form, Input, Rate, Row, Select, Table, Tag, Typography } from 'antd';
import type { TableProps } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DocumentPreviewDrawer } from '@/features/documents/components/DocumentPreviewDrawer';
import type { DocumentVersion } from '@/features/documents/types';
import { FormDrawer, PageHeader } from '@/shared/components';
import { formatDate } from '@/shared/utils/format';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { useRecruitmentStore } from '../store';
import type { Interview, InterviewMode, OfferStatus, Recommendation } from '../types';

interface InterviewForm {
  date: Dayjs;
  panel: string;
  mode: InterviewMode;
  link: string;
}

interface FeedbackForm {
  rating: number;
  notes: string;
  recommendation: Recommendation;
}

interface OfferForm {
  salary: string;
  joiningDate: Dayjs;
  status: OfferStatus;
}

export default function CandidatePage() {
  const { message } = App.useApp();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const candidates = useRecruitmentStore((state) => state.candidates);
  const vacancies = useRecruitmentStore((state) => state.vacancies);
  const saveInterview = useRecruitmentStore((state) => state.saveInterview);
  const saveOffer = useRecruitmentStore((state) => state.saveOffer);
  const candidate = candidates.find((item) => item.id === id);
  const vacancy = vacancies.find((item) => item.id === candidate?.vacancyId);
  const [preview, setPreview] = useState(false);
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [feedbackFor, setFeedbackFor] = useState<Interview | null>(null);
  const [interviewForm] = Form.useForm<InterviewForm>();
  const [feedbackForm] = Form.useForm<FeedbackForm>();

  const version: DocumentVersion | null = useMemo(() => {
    if (!candidate || !preview) return null;
    return {
      id: `${candidate.id}-cv`,
      fileName: candidate.cvFileName,
      mimeType: 'application/pdf',
      size: 1200,
      uploadedAt: new Date().toISOString(),
      dataUrl: candidate.cvDataUrl,
      remarks: '',
    };
  }, [candidate, preview]);

  if (!candidate) {
    return (
      <>
        <PageHeader title="Candidate" />
        <Typography.Paragraph>This candidate is not in the sample list.</Typography.Paragraph>
        <Link to="/recruitment">Back to vacancies</Link>
      </>
    );
  }

  const canConvert = candidate.stage === 'Selected' && candidate.offer?.status === 'Accepted';

  const saveInterviewForm = async () => {
    let values: InterviewForm;
    try {
      values = await interviewForm.validateFields();
    } catch {
      return;
    }
    saveInterview(candidate.id, {
      id: crypto.randomUUID(),
      date: values.date.format('YYYY-MM-DD'),
      panel: values.panel.trim(),
      mode: values.mode,
      link: values.link?.trim() ?? '',
      rating: null,
      notes: '',
      recommendation: '',
    });
    message.success('Interview saved.');
    setInterviewOpen(false);
  };

  const saveFeedback = async () => {
    if (!feedbackFor) return;
    let values: FeedbackForm;
    try {
      values = await feedbackForm.validateFields();
    } catch {
      return;
    }
    saveInterview(candidate.id, {
      ...feedbackFor,
      rating: values.rating,
      notes: values.notes.trim(),
      recommendation: values.recommendation,
    });
    message.success('Feedback saved.');
    setFeedbackFor(null);
  };

  const saveOfferForm = (values: OfferForm) => {
    saveOffer(candidate.id, {
      salary: values.salary.trim(),
      joiningDate: values.joiningDate.format('YYYY-MM-DD'),
      status: values.status,
    });
    message.success('Offer saved in this browser.');
  };

  const columns: TableProps<Interview>['columns'] = [
    { title: 'Date', dataIndex: 'date', width: 130, render: (value: string) => formatDate(value) },
    { title: 'Panel', dataIndex: 'panel' },
    { title: 'Mode', dataIndex: 'mode', width: 110 },
    {
      title: 'Feedback',
      key: 'feedback',
      render: (_, row) =>
        row.rating ? (
          <span>
            {row.rating}/5 · {row.recommendation}
          </span>
        ) : (
          <Typography.Text type="secondary">Not recorded</Typography.Text>
        ),
    },
    {
      title: '',
      key: 'edit',
      width: 140,
      render: (_, row) => (
        <Button
          size="small"
          onClick={() => {
            feedbackForm.setFieldsValue({
              rating: row.rating ?? 4,
              notes: row.notes,
              recommendation: row.recommendation || 'Advance',
            });
            setFeedbackFor(row);
          }}
        >
          Feedback
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={candidate.name}
        subtitle={`${vacancy?.title ?? 'Vacancy'} · ${candidate.stage}`}
        actions={
          <Flex gap={8}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/recruitment/pipeline?vacancy=${candidate.vacancyId}`)}>
              Pipeline
            </Button>
            <Button type="primary" disabled={!canConvert} onClick={() => navigate(`/recruitment/candidates/${candidate.id}/convert`)}>
              Convert to employee
            </Button>
          </Flex>
        }
      />
      <SampleDataNotice />
      {!canConvert && (
        <Typography.Paragraph type="secondary">
          Convert opens after the candidate is Selected and the offer is Accepted.
        </Typography.Paragraph>
      )}
      {candidate.converted && <Tag color="green">Convert wizard completed in this browser. No employee was created.</Tag>}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Profile" styles={{ body: { padding: 16 } }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Email">{candidate.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{candidate.phone}</Descriptions.Item>
              <Descriptions.Item label="Source">{candidate.source}</Descriptions.Item>
              <Descriptions.Item label="Stage">
                <Tag>{candidate.stage}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="CV">
                <Button type="link" style={{ padding: 0 }} onClick={() => setPreview(true)}>
                  {candidate.cvFileName}
                </Button>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Offer" styles={{ body: { padding: 16 } }}>
            <Form
              key={candidate.id}
              layout="vertical"
              initialValues={{
                salary: candidate.offer?.salary ?? '',
                joiningDate: candidate.offer ? dayjs(candidate.offer.joiningDate) : dayjs().add(1, 'month').startOf('month'),
                status: candidate.offer?.status ?? 'Draft',
              }}
              onFinish={saveOfferForm}
            >
              <Form.Item name="salary" label="Salary" rules={[{ required: true, message: 'Enter a salary' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="joiningDate" label="Joining date" rules={[{ required: true, message: 'Choose a date' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                <Select
                  options={(['Draft', 'Sent', 'Accepted', 'Declined'] as OfferStatus[]).map((value) => ({
                    value,
                    label: value,
                  }))}
                />
              </Form.Item>
              <Button type="primary" htmlType="submit">
                Save offer
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
      <Card
        title="Interviews"
        style={{ marginTop: 16 }}
        styles={{ body: { padding: 16 } }}
        extra={
          <Button
            type="primary"
            onClick={() => {
              interviewForm.resetFields();
              interviewForm.setFieldsValue({ date: dayjs(), mode: 'Video', panel: vacancy?.hiringManager ?? '' });
              setInterviewOpen(true);
            }}
          >
            Add interview
          </Button>
        }
      >
        <Table<Interview> rowKey="id" columns={columns} dataSource={candidate.interviews} pagination={false} />
      </Card>
      <DocumentPreviewDrawer version={version} title={`${candidate.name} — CV`} onClose={() => setPreview(false)} />
      <FormDrawer open={interviewOpen} title="Add interview" onClose={() => setInterviewOpen(false)} onSubmit={() => void saveInterviewForm()}>
        <Form form={interviewForm} layout="vertical">
          <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Choose a date' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="panel" label="Panel" rules={[{ required: true, message: 'Enter the panel' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="mode" label="Mode" rules={[{ required: true }]}>
            <Select options={(['In person', 'Video', 'Phone'] as InterviewMode[]).map((value) => ({ value, label: value }))} />
          </Form.Item>
          <Form.Item name="link" label="Link">
            <Input placeholder="Optional meeting link" />
          </Form.Item>
        </Form>
      </FormDrawer>
      <FormDrawer open={feedbackFor !== null} title="Interview feedback" onClose={() => setFeedbackFor(null)} onSubmit={() => void saveFeedback()}>
        <Form form={feedbackForm} layout="vertical">
          <Form.Item name="rating" label="Rating" rules={[{ required: true, message: 'Choose a rating' }]}>
            <Rate />
          </Form.Item>
          <Form.Item name="notes" label="Notes" rules={[{ required: true, message: 'Enter notes' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="recommendation" label="Recommendation" rules={[{ required: true, message: 'Choose a recommendation' }]}>
            <Select options={(['Advance', 'Hold', 'Reject'] as Recommendation[]).map((value) => ({ value, label: value }))} />
          </Form.Item>
        </Form>
      </FormDrawer>
    </>
  );
}
