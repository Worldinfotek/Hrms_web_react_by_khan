import { Drawer, Table, Typography } from 'antd';
import type { TableProps } from 'antd';
import { formatDateTime } from '@/shared/utils/format';
import { formatFileSize } from '../sampleFiles';
import type { DocumentVersion } from '../types';

interface VersionHistoryDrawerProps {
  open: boolean;
  title: string;
  versions: DocumentVersion[];
  onClose: () => void;
  onPreview: (version: DocumentVersion) => void;
}

export function VersionHistoryDrawer({ open, title, versions, onClose, onPreview }: VersionHistoryDrawerProps) {
  const columns: TableProps<DocumentVersion>['columns'] = [
    {
      title: 'File',
      dataIndex: 'fileName',
      render: (name: string, version) => (
        <div>
          <div>{name}</div>
          <Typography.Text type="secondary">{version.remarks || '—'}</Typography.Text>
        </div>
      ),
    },
    {
      title: 'Uploaded',
      dataIndex: 'uploadedAt',
      width: 180,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      width: 90,
      render: (size: number) => formatFileSize(size),
    },
    {
      title: '',
      key: 'preview',
      width: 90,
      render: (_, version) => (
        <Typography.Link onClick={() => onPreview(version)}>Preview</Typography.Link>
      ),
    },
  ];

  return (
    <Drawer open={open} title={title} onClose={onClose} size={640}>
      <Table<DocumentVersion>
        rowKey="id"
        columns={columns}
        dataSource={versions}
        pagination={false}
        size="small"
      />
    </Drawer>
  );
}
