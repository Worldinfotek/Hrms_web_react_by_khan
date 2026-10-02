import { InboxOutlined } from '@ant-design/icons';
import { Alert, Card, Table, Typography, Upload } from 'antd';
import { useState } from 'react';
import { PageHeader } from '@/shared/components';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { AttendanceStatusTag } from '../components/AttendanceStatusTag';
import type { AttendanceStatus } from '../types';

interface PreviewRow {
  key: string;
  employee: string;
  date: string;
  status: AttendanceStatus;
  result: string;
}

const SAMPLE_ROWS: PreviewRow[] = [
  { key: '1', employee: 'Hira Shah (WIT-0006)', date: 'Today', status: 'Present', result: 'Ready' },
  { key: '2', employee: 'Ali Raza (WIT-0007)', date: 'Today', status: 'Late', result: 'Ready' },
  { key: '3', employee: 'WIT-9999', date: 'Today', status: 'Present', result: 'Skipped — unknown employee' },
];

export default function ImportAttendancePage() {
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <>
      <PageHeader title="Attendance import" subtitle="Upload step only. The file is not sent to the server." />
      <SampleDataNotice />
      <Card styles={{ body: { padding: 16 } }}>
        <Upload.Dragger
          accept=".csv,.xlsx"
          maxCount={1}
          showUploadList={false}
          beforeUpload={(file) => {
            setFileName(file.name);
            return false;
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Drop an Excel or CSV file here</p>
          <p className="ant-upload-hint">A sample result is shown so you can see the review step.</p>
        </Upload.Dragger>
        {fileName && (
          <>
            <Alert
              style={{ marginTop: 16 }}
              type="success"
              showIcon
              title={`Sample result for ${fileName}`}
              description="2 rows are ready. 1 row was skipped. Nothing was saved."
            />
            <Table<PreviewRow>
              style={{ marginTop: 16 }}
              rowKey="key"
              pagination={false}
              dataSource={SAMPLE_ROWS}
              columns={[
                { title: 'Employee', dataIndex: 'employee' },
                { title: 'Date', dataIndex: 'date', width: 100 },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  width: 120,
                  render: (status: AttendanceStatus) => <AttendanceStatusTag status={status} />,
                },
                {
                  title: 'Result',
                  dataIndex: 'result',
                  render: (value: string) => (
                    <Typography.Text type={value.startsWith('Skipped') ? 'danger' : undefined}>{value}</Typography.Text>
                  ),
                },
              ]}
            />
          </>
        )}
      </Card>
    </>
  );
}
