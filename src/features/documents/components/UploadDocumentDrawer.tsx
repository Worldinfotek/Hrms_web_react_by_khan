import { InboxOutlined } from '@ant-design/icons';
import { App, DatePicker, Form, Input, Select, Upload } from 'antd';
import type { UploadProps } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useState } from 'react';
import { FormDrawer } from '@/shared/components';
import { readFileAsDataUrl } from '../sampleFiles';
import { useDocumentStore, validateUploadFile } from '../store';

interface UploadFormValues {
  documentTypeId: string;
  documentNumber: string;
  issueDate?: Dayjs;
  expiryDate?: Dayjs;
  remarks?: string;
}

interface UploadDocumentDrawerProps {
  open: boolean;
  employeeCode: string;
  initialFile?: File | null;
  defaultTypeId?: string;
  onClose: () => void;
}

export function UploadDocumentDrawer({
  open,
  employeeCode,
  initialFile,
  defaultTypeId,
  onClose,
}: UploadDocumentDrawerProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<UploadFormValues>();
  const types = useDocumentStore((state) => state.types);
  const upload = useDocumentStore((state) => state.upload);
  const [file, setFile] = useState<File | null>(initialFile ?? null);
  const [saving, setSaving] = useState(false);
  const typeId = Form.useWatch('documentTypeId', form);
  const selectedType = types.find((type) => type.id === typeId);
  const activeTypes = types.filter((type) => type.isActive || type.id === defaultTypeId);

  const beforeUpload: UploadProps['beforeUpload'] = (next) => {
    const error = validateUploadFile(next);
    if (error) {
      message.error(error);
      return Upload.LIST_IGNORE;
    }
    setFile(next);
    return false;
  };

  const onSubmit = async () => {
    let values: UploadFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    if (!file) {
      message.error('Choose a file to upload.');
      return;
    }
    setSaving(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const result = upload({
        employeeCode,
        documentTypeId: values.documentTypeId,
        documentNumber: values.documentNumber.trim(),
        issueDate: values.issueDate ? values.issueDate.format('YYYY-MM-DD') : null,
        expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : null,
        version: {
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          uploadedAt: dayjs().toISOString(),
          dataUrl,
          remarks: values.remarks?.trim() ?? '',
        },
      });
      message.success(result === 'versioned' ? 'Saved as a new version.' : 'Document uploaded.');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormDrawer open={open} title="Upload document" onClose={onClose} onSubmit={onSubmit} submitting={saving} submitText="Upload">
      <Form form={form} layout="vertical" requiredMark="optional" initialValues={{ documentTypeId: defaultTypeId }}>
        <Form.Item name="documentTypeId" label="Document type" rules={[{ required: true, message: 'Choose a document type.' }]}>
          <Select
            placeholder="Select a type"
            options={activeTypes.map((type) => ({
              value: type.id,
              label: `${type.name} · ${type.category}`,
            }))}
          />
        </Form.Item>
        <Form.Item name="documentNumber" label="Document number" rules={[{ required: true, message: 'Enter the document number.' }]}>
          <Input placeholder="e.g. 35202-1234567-1" maxLength={80} />
        </Form.Item>
        <Form.Item name="issueDate" label="Issue date">
          <DatePicker style={{ width: '100%' }} format="DD MMM YYYY" />
        </Form.Item>
        <Form.Item
          name="expiryDate"
          label="Expiry date"
          rules={
            selectedType?.expiryRequired
              ? [{ required: true, message: 'This document type requires an expiry date.' }]
              : []
          }
        >
          <DatePicker style={{ width: '100%' }} format="DD MMM YYYY" />
        </Form.Item>
        <Form.Item name="remarks" label="Remarks">
          <Input.TextArea rows={2} maxLength={300} />
        </Form.Item>
        <Form.Item label="File" required>
          <Upload.Dragger
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            maxCount={1}
            fileList={
              file
                ? [{ uid: 'selected', name: file.name, size: file.size, status: 'done' }]
                : []
            }
            beforeUpload={beforeUpload}
            onRemove={() => {
              setFile(null);
              return true;
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Drop a PDF or image here</p>
            <p className="ant-upload-hint">PDF, PNG, JPG or WEBP, up to 2 MB</p>
          </Upload.Dragger>
        </Form.Item>
      </Form>
    </FormDrawer>
  );
}
