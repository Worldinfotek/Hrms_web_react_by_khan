import { CheckCircleOutlined, EditOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons';
import { App, Button, Card, Flex, Form, Input, Switch, Table, Tag, Tooltip, Typography } from 'antd';
import type { TableProps } from 'antd';
import { useState } from 'react';
import { ConfirmAction, FormDrawer, PageHeader } from '@/shared/components';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { useDocumentStore } from '../store';
import type { DocumentType } from '../types';

interface TypeFormValues {
  category: string;
  name: string;
  mandatory: boolean;
  expiryRequired: boolean;
  sensitive: boolean;
  isActive: boolean;
}

export default function DocumentTypesPage() {
  const { message } = App.useApp();
  const types = useDocumentStore((state) => state.types);
  const saveType = useDocumentStore((state) => state.saveType);
  const setTypeActive = useDocumentStore((state) => state.setTypeActive);
  const [editing, setEditing] = useState<DocumentType | null>(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<TypeFormValues>();

  const startCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ mandatory: false, expiryRequired: false, sensitive: false, isActive: true });
    setOpen(true);
  };

  const startEdit = (type: DocumentType) => {
    setEditing(type);
    form.setFieldsValue(type);
    setOpen(true);
  };

  const onSubmit = async () => {
    let values: TypeFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    saveType({
      id: editing?.id ?? crypto.randomUUID(),
      category: values.category.trim(),
      name: values.name.trim(),
      mandatory: values.mandatory,
      expiryRequired: values.expiryRequired,
      sensitive: values.sensitive,
      isActive: values.isActive,
    });
    message.success(editing ? 'Document type updated.' : 'Document type added.');
    setOpen(false);
  };

  const columns: TableProps<DocumentType>['columns'] = [
    {
      title: 'Document type',
      dataIndex: 'name',
      render: (name: string, type) => (
        <div>
          <div>{name}</div>
          <Typography.Text type="secondary">{type.category}</Typography.Text>
        </div>
      ),
    },
    {
      title: 'Mandatory',
      dataIndex: 'mandatory',
      width: 120,
      render: (value: boolean) => (value ? <Tag color="blue">Mandatory</Tag> : '—'),
    },
    {
      title: 'Expiry',
      dataIndex: 'expiryRequired',
      width: 120,
      render: (value: boolean) => (value ? 'Required' : '—'),
    },
    {
      title: 'Sensitive',
      dataIndex: 'sensitive',
      width: 110,
      render: (value: boolean) => (value ? <Tag color="gold">Sensitive</Tag> : '—'),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      width: 110,
      render: (active: boolean) => <Tag color={active ? 'green' : 'default'}>{active ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      render: (_, type) => (
        <Flex gap={4} justify="flex-end">
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} aria-label={`Edit ${type.name}`} onClick={() => startEdit(type)} />
          </Tooltip>
          <ConfirmAction
            title={`${type.isActive ? 'Deactivate' : 'Activate'} "${type.name}"?`}
            description={type.isActive ? 'It will no longer appear in the upload list or the missing-document check.' : undefined}
            danger={type.isActive}
            onConfirm={() => {
              setTypeActive(type.id, !type.isActive);
              message.success(type.isActive ? 'Document type deactivated.' : 'Document type activated.');
            }}
          >
            <Tooltip title={type.isActive ? 'Deactivate' : 'Activate'}>
              <Button
                type="text"
                aria-label={type.isActive ? `Deactivate ${type.name}` : `Activate ${type.name}`}
                icon={type.isActive ? <StopOutlined /> : <CheckCircleOutlined style={{ color: '#52c41a' }} />}
              />
            </Tooltip>
          </ConfirmAction>
        </Flex>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Document types"
        subtitle="Categories used on employee files. Mandatory types appear on the missing-documents list."
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={startCreate}>
            Add document type
          </Button>
        }
      />
      <SampleDataNotice />
      <Card styles={{ body: { padding: 16 } }}>
        <Table<DocumentType> rowKey="id" columns={columns} dataSource={types} pagination={false} />
      </Card>
      <FormDrawer
        open={open}
        title={editing ? 'Edit document type' : 'Add document type'}
        onClose={() => setOpen(false)}
        onSubmit={onSubmit}
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Enter a category.' }]}>
            <Input placeholder="Identity, Employment, Education…" maxLength={60} />
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Enter a name.' }]}>
            <Input placeholder="CNIC" maxLength={80} />
          </Form.Item>
          <Form.Item name="mandatory" label="Mandatory" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="expiryRequired" label="Expiry date required" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="sensitive" label="Sensitive" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </FormDrawer>
    </>
  );
}
