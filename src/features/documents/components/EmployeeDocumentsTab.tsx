import { DeleteOutlined, EyeOutlined, HistoryOutlined, UploadOutlined } from '@ant-design/icons';
import { App, Button, Flex, Table, Tag, Tooltip, Typography, Upload } from 'antd';
import type { TableProps, UploadProps } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { ConfirmAction, EmptyState } from '@/shared/components';
import { formatDate } from '@/shared/utils/format';
import { latestVersion } from '../logic';
import { useDocumentStore, validateUploadFile } from '../store';
import type { DocumentVersion, EmployeeDocument } from '../types';
import { DocumentPreviewDrawer } from './DocumentPreviewDrawer';
import { SampleDataNotice } from './SampleDataNotice';
import { UploadDocumentDrawer } from './UploadDocumentDrawer';
import { VersionHistoryDrawer } from './VersionHistoryDrawer';

interface EmployeeDocumentsTabProps {
  employeeCode: string;
}

export function EmployeeDocumentsTab({ employeeCode }: EmployeeDocumentsTabProps) {
  const { message } = App.useApp();
  const types = useDocumentStore((state) => state.types);
  const allDocuments = useDocumentStore((state) => state.documents);
  const documents = useMemo(
    () => allDocuments.filter((document) => document.employeeCode === employeeCode),
    [allDocuments, employeeCode],
  );
  const removeDocument = useDocumentStore((state) => state.removeDocument);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadSession, setUploadSession] = useState(0);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [defaultTypeId, setDefaultTypeId] = useState<string | undefined>();
  const [preview, setPreview] = useState<{ version: DocumentVersion; title: string } | null>(null);
  const [history, setHistory] = useState<EmployeeDocument | null>(null);

  const typeName = (id: string) => types.find((type) => type.id === id);

  const openUpload = (file?: File, typeId?: string) => {
    setPendingFile(file ?? null);
    setDefaultTypeId(typeId);
    setUploadSession((current) => current + 1);
    setUploadOpen(true);
  };

  const onDrop: UploadProps['beforeUpload'] = (file) => {
    const error = validateUploadFile(file);
    if (error) {
      message.error(error);
      return Upload.LIST_IGNORE;
    }
    openUpload(file);
    return false;
  };

  const columns: TableProps<EmployeeDocument>['columns'] = [
    {
      title: 'Document',
      key: 'name',
      render: (_, document) => {
        const type = typeName(document.documentTypeId);
        const current = latestVersion(document);
        return (
          <div>
            <Flex gap={8} align="center" wrap>
              <Typography.Text strong>{type?.name ?? 'Document'}</Typography.Text>
              {type?.sensitive && <Tag color="gold">Sensitive</Tag>}
              {type && !type.isActive && <Tag>Inactive type</Tag>}
            </Flex>
            <Typography.Text type="secondary">
              {type?.category ?? '—'} · {current?.fileName}
            </Typography.Text>
          </div>
        );
      },
    },
    { title: 'Number', dataIndex: 'documentNumber', width: 180 },
    {
      title: 'Issue',
      dataIndex: 'issueDate',
      width: 130,
      render: (value: string | null) => formatDate(value),
    },
    {
      title: 'Expiry',
      dataIndex: 'expiryDate',
      width: 150,
      render: (value: string | null) => {
        if (!value) return '—';
        const days = dayjs(value).startOf('day').diff(dayjs().startOf('day'), 'day');
        const color = days < 0 ? 'red' : days <= 30 ? 'orange' : undefined;
        return <Typography.Text type={color === 'red' ? 'danger' : undefined} style={color === 'orange' ? { color: '#d48806' } : undefined}>{formatDate(value)}</Typography.Text>;
      },
    },
    {
      title: 'Versions',
      key: 'versions',
      width: 90,
      render: (_, document) => document.versions.length,
    },
    {
      title: '',
      key: 'actions',
      width: 150,
      render: (_, document) => {
        const current = latestVersion(document);
        const type = typeName(document.documentTypeId);
        return (
          <Flex gap={4} justify="flex-end">
            <Tooltip title="Preview">
              <Button
                type="text"
                icon={<EyeOutlined />}
                aria-label="Preview"
                disabled={!current}
                onClick={() => current && setPreview({ version: current, title: type?.name ?? 'Document' })}
              />
            </Tooltip>
            <Tooltip title="Version history">
              <Button
                type="text"
                icon={<HistoryOutlined />}
                aria-label="Version history"
                onClick={() => setHistory(document)}
              />
            </Tooltip>
            <Tooltip title="Upload a new version">
              <Button
                type="text"
                icon={<UploadOutlined />}
                aria-label="Upload a new version"
                onClick={() => openUpload(undefined, document.documentTypeId)}
              />
            </Tooltip>
            <ConfirmAction
              title="Remove this document?"
              description="This removes the sample file from this browser only."
              onConfirm={() => removeDocument(document.id)}
            >
              <Tooltip title="Remove">
                <Button type="text" danger icon={<DeleteOutlined />} aria-label="Remove document" />
              </Tooltip>
            </ConfirmAction>
          </Flex>
        );
      },
    },
  ];

  return (
    <>
      <SampleDataNotice />
      <Flex justify="flex-end" style={{ marginBottom: 12 }}>
        <Button type="primary" icon={<UploadOutlined />} onClick={() => openUpload()}>
          Upload document
        </Button>
      </Flex>
      <Upload.Dragger
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        showUploadList={false}
        beforeUpload={onDrop}
        style={{ marginBottom: 16 }}
      >
        <Typography.Text>Drop a file here to upload it for this employee</Typography.Text>
      </Upload.Dragger>
      <Table<EmployeeDocument>
        rowKey="id"
        columns={columns}
        dataSource={documents}
        pagination={false}
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: <EmptyState description="No documents for this employee yet" /> }}
      />
      <UploadDocumentDrawer
        key={uploadSession}
        open={uploadOpen}
        employeeCode={employeeCode}
        initialFile={pendingFile}
        defaultTypeId={defaultTypeId}
        onClose={() => setUploadOpen(false)}
      />
      <DocumentPreviewDrawer
        version={preview?.version ?? null}
        title={preview?.title ?? 'Preview'}
        onClose={() => setPreview(null)}
      />
      <VersionHistoryDrawer
        open={history !== null}
        title={history ? `${typeName(history.documentTypeId)?.name ?? 'Document'} versions` : 'Versions'}
        versions={history?.versions ?? []}
        onClose={() => setHistory(null)}
        onPreview={(version) =>
          setPreview({
            version,
            title: history ? (typeName(history.documentTypeId)?.name ?? 'Document') : 'Preview',
          })
        }
      />
    </>
  );
}
