import {
  ArrowLeftOutlined,
  CheckCircleTwoTone,
  DownloadOutlined,
  InboxOutlined,
  WarningTwoTone,
} from '@ant-design/icons';
import {
  Alert,
  App,
  Button,
  Card,
  Flex,
  Result,
  Statistic,
  Steps,
  Table,
  Tag,
  Typography,
  Upload,
} from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components';
import { getErrorMessage } from '@/shared/utils/errors';
import { downloadFile, employeesApi, useRunImport } from '../api/employeesApi';
import type { ImportReport, ImportRowResult } from '../types';

/** Import wizard: template → upload & check → review errors → import. */
export default function EmployeeImportPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [result, setResult] = useState<ImportReport | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const runImport = useRunImport();

  const step = result ? 3 : report ? 2 : file ? 1 : 0;

  const check = async (chosen: File) => {
    setFile(chosen);
    setReport(null);
    setError(null);
    setChecking(true);
    try {
      setReport(await employeesApi.validateImport(chosen));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setChecking(false);
    }
  };

  const doImport = (skipInvalid: boolean) => {
    if (!file) return;
    runImport.mutate(
      { file, skipInvalid },
      {
        onSuccess: (r) => {
          setResult(r);
          message.success(`${r.importedRows} employee(s) imported.`);
        },
        onError: (err) => setError(getErrorMessage(err)),
      },
    );
  };

  const reset = () => {
    setFile(null);
    setReport(null);
    setResult(null);
    setError(null);
  };

  return (
    <>
      <PageHeader
        title="Import employees"
        subtitle="Add many employees at once from Excel. Every row is checked before anything is saved."
        actions={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/employees')}>
            Employees
          </Button>
        }
      />
      <Card>
        <Steps
          current={step}
          size="small"
          style={{ marginBottom: 24 }}
          items={[{ title: 'Template' }, { title: 'Upload & check' }, { title: 'Review' }, { title: 'Done' }]}
        />
        {error && (
          <Alert
            type="error"
            showIcon
            title={error}
            style={{ marginBottom: 16 }}
            closable
            onClose={() => setError(null)}
          />
        )}

        {!result && (
          <Flex vertical gap={16}>
            <Card size="small" title="1. Download the template">
              <Flex justify="space-between" align="center" wrap gap={12}>
                <Typography.Text type="secondary">
                  Orange columns are required. The <b>Lists</b> sheet shows the valid codes for branches,
                  departments, designations and other dropdowns. Leave EmployeeCode empty to generate codes.
                </Typography.Text>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() =>
                    downloadFile(
                      '/employees/import/template',
                      undefined,
                      'employee-import-template.xlsx',
                    ).catch((err) => message.error(getErrorMessage(err)))
                  }
                >
                  Download template
                </Button>
              </Flex>
            </Card>
            <Card size="small" title="2. Upload the filled file">
              <Upload.Dragger
                accept=".xlsx"
                maxCount={1}
                showUploadList={false}
                beforeUpload={(f) => {
                  if (f.size > 10 * 1024 * 1024) {
                    message.error('The file is larger than 10 MB.');
                  } else {
                    void check(f);
                  }
                  return false;
                }}
                disabled={checking}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  {checking ? 'Checking every row…' : 'Click or drag the .xlsx file here'}
                </p>
                <p className="ant-upload-hint">
                  {file ? `Selected: ${file.name}` : 'Nothing is saved at this step.'}
                </p>
              </Upload.Dragger>
            </Card>
          </Flex>
        )}

        {report && !result && (
          <Card size="small" title="3. Review" style={{ marginTop: 16 }}>
            <Flex gap={48} wrap style={{ marginBottom: 16 }}>
              <Statistic title="Rows" value={report.totalRows} />
              <Statistic
                title="Ready to import"
                value={report.validRows}
                styles={{ content: { color: '#389e0d' } }}
              />
              <Statistic
                title="With errors"
                value={report.invalidRows}
                styles={{ content: { color: report.invalidRows ? '#cf1322' : undefined } }}
              />
            </Flex>
            <Table<ImportRowResult>
              rowKey="rowNumber"
              size="small"
              dataSource={[...report.rows].sort(
                (a, b) => Number(a.isValid) - Number(b.isValid) || a.rowNumber - b.rowNumber,
              )}
              pagination={{ pageSize: 20, hideOnSinglePage: true }}
              scroll={{ x: 'max-content' }}
              columns={[
                { title: 'Row', dataIndex: 'rowNumber', width: 70 },
                {
                  title: 'Result',
                  dataIndex: 'isValid',
                  width: 110,
                  render: (valid: boolean) =>
                    valid ? (
                      <Tag icon={<CheckCircleTwoTone twoToneColor="#52c41a" />} color="success">
                        OK
                      </Tag>
                    ) : (
                      <Tag icon={<WarningTwoTone twoToneColor="#cf1322" />} color="error">
                        Error
                      </Tag>
                    ),
                },
                { title: 'Name', dataIndex: 'name' },
                {
                  title: 'Problems',
                  dataIndex: 'errors',
                  render: (errors: string[]) =>
                    errors.length ? (
                      <ul style={{ margin: 0, paddingInlineStart: 16 }}>
                        {errors.map((e) => (
                          <li key={e}>
                            <Typography.Text type="danger">{e}</Typography.Text>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      '—'
                    ),
                },
              ]}
            />
            <Flex gap={8} justify="flex-end" wrap style={{ marginTop: 16 }}>
              <Button onClick={reset}>Choose another file</Button>
              {report.invalidRows > 0 && report.validRows > 0 && (
                <Button onClick={() => doImport(true)} loading={runImport.isPending}>
                  Import only the {report.validRows} valid row(s)
                </Button>
              )}
              <Button
                type="primary"
                disabled={report.invalidRows > 0 || report.validRows === 0}
                onClick={() => doImport(false)}
                loading={runImport.isPending}
              >
                Import {report.validRows} employee(s)
              </Button>
            </Flex>
            {report.invalidRows > 0 && (
              <Typography.Paragraph type="secondary" style={{ marginTop: 8, textAlign: 'right' }}>
                Fix the rows in Excel and upload again, or import only the valid rows.
              </Typography.Paragraph>
            )}
          </Card>
        )}

        {result && (
          <Result
            status="success"
            title={`${result.importedRows} employee(s) imported`}
            subTitle={
              result.invalidRows
                ? `${result.invalidRows} row(s) with errors were skipped.`
                : 'Every row was imported.'
            }
            extra={[
              <Button type="primary" key="list" onClick={() => navigate('/employees')}>
                View employees
              </Button>,
              <Button key="again" onClick={reset}>
                Import another file
              </Button>,
            ]}
          >
            <Typography.Paragraph type="secondary" style={{ textAlign: 'center' }}>
              New codes:{' '}
              {result.rows
                .filter((r) => r.isValid && r.employeeCode)
                .slice(0, 10)
                .map((r) => (
                  <Tag key={r.rowNumber}>{r.employeeCode}</Tag>
                ))}
              {result.importedRows > 10 ? '…' : ''}
            </Typography.Paragraph>
          </Result>
        )}
      </Card>
    </>
  );
}
