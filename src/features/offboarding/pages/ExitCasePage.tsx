import { App, Button, Card, Descriptions, Flex, Form, Input, Table, Tag, Typography } from 'antd';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DocumentPreviewDrawer } from '@/features/documents/components/DocumentPreviewDrawer';
import type { DocumentVersion } from '@/features/documents/types';
import { PageHeader } from '@/shared/components';
import { formatDate } from '@/shared/utils/format';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { useOffboardingStore } from '../store';
import { exitStage, settlementNet, type ClearanceItem } from '../types';

export default function ExitCasePage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { id } = useParams();
  const cases = useOffboardingStore((state) => state.cases);
  const approve = useOffboardingStore((state) => state.approve);
  const signOff = useOffboardingStore((state) => state.signOff);
  const saveInterview = useOffboardingStore((state) => state.saveInterview);
  const generateLetter = useOffboardingStore((state) => state.generateLetter);
  const item = cases.find((row) => row.id === id);
  const [notes, setNotes] = useState(item?.interviewNotes ?? '');
  const [preview, setPreview] = useState<DocumentVersion | null>(null);

  if (!item) {
    return (
      <>
        <PageHeader title="Exit" />
        <Button onClick={() => navigate('/offboarding')}>Back to offboarding</Button>
      </>
    );
  }

  const stage = exitStage(item);
  const letter: DocumentVersion | null = item.letterDataUrl
    ? {
        id: `${item.id}-letter`,
        fileName: item.letterFileName ?? 'relieving.pdf',
        mimeType: 'application/pdf',
        size: 1200,
        uploadedAt: item.lastWorkingDay,
        dataUrl: item.letterDataUrl,
        remarks: '',
      }
    : null;

  return (
    <>
      <PageHeader
        title={item.employeeName}
        subtitle={`${item.kind} · ${stage}`}
        actions={<Button onClick={() => navigate('/offboarding')}>All exits</Button>}
      />
      <SampleDataNotice />
      <Descriptions bordered size="small" column={1} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Department">{item.department}</Descriptions.Item>
        <Descriptions.Item label="Last working day">{formatDate(item.lastWorkingDay)}</Descriptions.Item>
        <Descriptions.Item label="Notice">{item.noticeDays} days</Descriptions.Item>
        <Descriptions.Item label="Reason">{item.reason}</Descriptions.Item>
        <Descriptions.Item label="Manager">{item.managerApproved ? 'Approved' : 'Pending'}</Descriptions.Item>
        <Descriptions.Item label="HR">{item.hrApproved ? 'Approved' : 'Pending'}</Descriptions.Item>
      </Descriptions>
      <Flex gap={8} wrap style={{ marginBottom: 16 }}>
        <Button disabled={item.managerApproved} onClick={() => approve(item.id, 'manager')}>
          Manager approves
        </Button>
        <Button disabled={item.hrApproved} type="primary" onClick={() => approve(item.id, 'hr')}>
          HR approves
        </Button>
      </Flex>
      <Card title="Clearance" styles={{ body: { padding: 16 } }} style={{ marginBottom: 16 }}>
        <Table<ClearanceItem>
          rowKey="area"
          pagination={false}
          dataSource={item.clearance}
          columns={[
            { title: 'Area', dataIndex: 'area' },
            { title: 'Owner', dataIndex: 'owner' },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (value: ClearanceItem['status']) => <Tag color={value === 'Signed off' ? 'green' : 'gold'}>{value}</Tag>,
            },
            {
              title: '',
              key: 'sign',
              render: (_, row) => (
                <Button type="link" disabled={row.status === 'Signed off'} onClick={() => signOff(item.id, row.area)}>
                  Sign off
                </Button>
              ),
            },
          ]}
        />
      </Card>
      <Card title="Exit interview" styles={{ body: { padding: 16 } }} style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Form.Item label="Notes">
            <Input.TextArea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} />
          </Form.Item>
          <Button
            onClick={() => {
              saveInterview(item.id, notes.trim());
              message.success('Interview saved in this browser.');
            }}
          >
            Save interview
          </Button>
        </Form>
      </Card>
      <Card title="Final settlement" styles={{ body: { padding: 16 } }} style={{ marginBottom: 16 }}>
        {item.settlement ? (
          <>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Pending days">{item.settlement.pendingDays}</Descriptions.Item>
              <Descriptions.Item label="Leave encashment">{item.settlement.leaveEncashment.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Loan recovery">{item.settlement.loanRecovery.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Net">{settlementNet(item.settlement).toLocaleString()}</Descriptions.Item>
            </Descriptions>
            <Typography.Paragraph style={{ marginTop: 12, marginBottom: 0 }}>
              This figure will feed payroll later. It is not posted to the payroll run.
            </Typography.Paragraph>
          </>
        ) : (
          <Typography.Text type="secondary">Settlement opens when every clearance area is signed off.</Typography.Text>
        )}
      </Card>
      <Card title="Experience and relieving letter" styles={{ body: { padding: 16 } }}>
        {letter ? (
          <Button type="link" onClick={() => setPreview(letter)}>
            {letter.fileName}
          </Button>
        ) : (
          <Button onClick={() => generateLetter(item.id)}>Create relieving letter</Button>
        )}
      </Card>
      <DocumentPreviewDrawer version={preview} title="Relieving letter" onClose={() => setPreview(null)} />
    </>
  );
}
