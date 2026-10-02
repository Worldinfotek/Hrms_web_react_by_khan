import { DownloadOutlined } from '@ant-design/icons';
import { Button, Drawer, Flex, Typography } from 'antd';
import { downloadDataUrl, formatFileSize } from '../sampleFiles';
import type { DocumentVersion } from '../types';

interface DocumentPreviewDrawerProps {
  version: DocumentVersion | null;
  title: string;
  onClose: () => void;
}

export function DocumentPreviewDrawer({ version, title, onClose }: DocumentPreviewDrawerProps) {
  const isImage = version?.mimeType.startsWith('image/') ?? false;
  const isPdf = version?.mimeType === 'application/pdf';

  return (
    <Drawer
      open={version !== null}
      title={title}
      onClose={onClose}
      size={720}
      extra={
        version && (
          <Button
            icon={<DownloadOutlined />}
            onClick={() => downloadDataUrl(version.dataUrl, version.fileName)}
          >
            Download
          </Button>
        )
      }
    >
      {version && (
        <Flex vertical gap={12}>
          <Typography.Text type="secondary">
            {version.fileName} · {formatFileSize(version.size)}
          </Typography.Text>
          {isImage && (
            <img
              src={version.dataUrl}
              alt={version.fileName}
              style={{ width: '100%', borderRadius: 8, background: '#F4F8FB' }}
            />
          )}
          {isPdf && (
            <iframe
              title={version.fileName}
              src={version.dataUrl}
              style={{ width: '100%', height: 480, border: '1px solid #DCE6EF', borderRadius: 8 }}
            />
          )}
          {!isImage && !isPdf && (
            <Typography.Text>Preview is available for PDF and image files. Download the file to open it.</Typography.Text>
          )}
        </Flex>
      )}
    </Drawer>
  );
}
