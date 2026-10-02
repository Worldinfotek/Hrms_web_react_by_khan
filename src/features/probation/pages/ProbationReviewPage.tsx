import { ArrowLeftOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Form, Input, InputNumber, Radio, Rate, Row, Typography, Upload } from 'antd';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DocumentPreviewDrawer } from '@/features/documents/components/DocumentPreviewDrawer';
import { readFileAsDataUrl } from '@/features/documents/sampleFiles';
import type { DocumentVersion } from '@/features/documents/types';
import { PageHeader } from '@/shared/components';
import { formatDate } from '@/shared/utils/format';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { useProbationStore } from '../store';
import { CRITERIA, type ProbationOutcome, type Recommendation } from '../types';

export default function ProbationReviewPage() {
  const { message } = App.useApp();
  const { employeeCode = '' } = useParams();
  const navigate = useNavigate();
  const cases = useProbationStore((state) => state.cases);
  const saveEvaluation = useProbationStore((state) => state.saveEvaluation);
  const applyDecision = useProbationStore((state) => state.applyDecision);
  const setLetter = useProbationStore((state) => state.setLetter);
  const generateLetter = useProbationStore((state) => state.generateLetter);
  const item = cases.find((row) => row.employeeCode === employeeCode);
  const [preview, setPreview] = useState(false);
  const [evalForm] = Form.useForm<{ scores: number[]; comments: string; recommendation: Recommendation }>();
  const [decisionForm] = Form.useForm<{ outcome: Exclude<ProbationOutcome, 'Awaiting'>; extendDays: number; comment: string }>();

  if (!item) {
    return (
      <>
        <PageHeader title="Probation review" />
        <Button onClick={() => navigate('/probation')}>Back</Button>
      </>
    );
  }

  const version: DocumentVersion | null =
    preview && item.letterDataUrl && item.letterFileName
      ? {
          id: `${item.employeeCode}-letter`,
          fileName: item.letterFileName,
          mimeType: item.letterDataUrl.startsWith('data:image/') ? 'image/png' : 'application/pdf',
          size: 1400,
          uploadedAt: new Date().toISOString(),
          dataUrl: item.letterDataUrl,
          remarks: '',
        }
      : null;

  const saveEval = async () => {
    let values: { scores: number[]; comments: string; recommendation: Recommendation };
    try {
      values = await evalForm.validateFields();
    } catch {
      return;
    }
    saveEvaluation(item.employeeCode, {
      criteria: CRITERIA.map((name, index) => ({ name, score: values.scores?.[index] ?? item.evaluation?.criteria[index]?.score ?? 3 })),
      comments: values.comments.trim(),
      recommendation: values.recommendation,
    });
    message.success('Evaluation saved in this browser.');
  };

  const saveDecision = async () => {
    let values: { outcome: Exclude<ProbationOutcome, 'Awaiting'>; extendDays: number; comment: string };
    try {
      values = await decisionForm.validateFields();
    } catch {
      return;
    }
    applyDecision(item.employeeCode, values.outcome, values.extendDays ?? 30, values.comment.trim());
    if (values.outcome === 'Confirmed' && !item.letterDataUrl) generateLetter(item.employeeCode);
    message.success('Decision recorded in this browser.');
  };

  return (
    <>
      <PageHeader
        title={item.employeeName}
        subtitle={`${item.employeeCode} · ${item.department} · probation end ${formatDate(item.extendedEnd ?? item.probationEnd)}`}
        actions={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/probation')}>
            Dashboard
          </Button>
        }
      />
      <SampleDataNotice />
      <Typography.Paragraph>
        Outcome: <strong>{item.outcome}</strong>
        {item.confirmationDate ? ` · confirmed ${formatDate(item.confirmationDate)}` : ''}
        {item.extendedEnd ? ` · extended to ${formatDate(item.extendedEnd)}` : ''}
      </Typography.Paragraph>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Manager evaluation" styles={{ body: { padding: 16 } }}>
            <Form
              key={item.employeeCode}
              form={evalForm}
              layout="vertical"
              initialValues={{
                scores: CRITERIA.map((_, index) => item.evaluation?.criteria[index]?.score ?? 4),
                comments: item.evaluation?.comments ?? '',
                recommendation: item.evaluation?.recommendation ?? 'Confirm',
              }}
              onFinish={() => void saveEval()}
            >
              {CRITERIA.map((name, index) => (
                <Form.Item key={name} name={['scores', index]} label={name} rules={[{ required: true, message: 'Choose a score' }]}>
                  <Rate />
                </Form.Item>
              ))}
              <Form.Item name="comments" label="Comments" rules={[{ required: true, message: 'Enter comments' }]}>
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item name="recommendation" label="Recommendation" rules={[{ required: true }]}>
                <Radio.Group options={['Confirm', 'Extend', 'Do not confirm']} />
              </Form.Item>
              <Button type="primary" htmlType="submit">
                Save evaluation
              </Button>
            </Form>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="HR decision" styles={{ body: { padding: 16 } }} style={{ marginBottom: 16 }}>
            <Form
              key={`${item.employeeCode}-decision`}
              form={decisionForm}
              layout="vertical"
              initialValues={{
                outcome: item.outcome === 'Awaiting' ? 'Confirmed' : item.outcome,
                extendDays: 30,
                comment: item.decisionComment,
              }}
              onFinish={() => void saveDecision()}
            >
              <Form.Item name="outcome" label="Outcome" rules={[{ required: true }]}>
                <Radio.Group
                  options={[
                    { label: 'Confirm', value: 'Confirmed' },
                    { label: 'Extend', value: 'Extended' },
                    { label: 'Not confirm', value: 'Not confirmed' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="extendDays" label="Days to extend" extra="Used when the outcome is Extend.">
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="comment" label="Comment" rules={[{ required: true, message: 'Enter a comment' }]}>
                <Input.TextArea rows={3} />
              </Form.Item>
              <Button type="primary" htmlType="submit">
                Apply decision
              </Button>
            </Form>
          </Card>
          <Card title="Confirmation letter" styles={{ body: { padding: 16 } }}>
            {item.letterFileName ? (
              <Button type="link" style={{ padding: 0 }} onClick={() => setPreview(true)}>
                {item.letterFileName}
              </Button>
            ) : (
              <Typography.Paragraph type="secondary">No letter yet.</Typography.Paragraph>
            )}
            <div>
              <Button onClick={() => generateLetter(item.employeeCode)} style={{ marginRight: 8 }}>
                Generate letter
              </Button>
              <Upload
                maxCount={1}
                showUploadList={false}
                beforeUpload={(file) => {
                  void readFileAsDataUrl(file).then((dataUrl) => {
                    setLetter(item.employeeCode, file.name, dataUrl);
                    message.success('Letter attached in this browser.');
                  });
                  return false;
                }}
              >
                <Button>Upload letter</Button>
              </Upload>
            </div>
          </Card>
        </Col>
      </Row>
      <DocumentPreviewDrawer version={version} title={`${item.employeeName} — confirmation letter`} onClose={() => setPreview(false)} />
    </>
  );
}
