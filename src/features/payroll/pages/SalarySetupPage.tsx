import { Button, Card, Form, Input, Select, Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import { useState } from 'react';
import { FormDrawer, PageHeader } from '@/shared/components';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { usePayrollStore } from '../store';
import type { ComponentKind, PayComponent, SalaryStructure } from '../types';

export default function SalarySetupPage() {
  const components = usePayrollStore((state) => state.components);
  const structures = usePayrollStore((state) => state.structures);
  const saveComponent = usePayrollStore((state) => state.saveComponent);
  const saveStructure = usePayrollStore((state) => state.saveStructure);
  const [componentOpen, setComponentOpen] = useState(false);
  const [structureOpen, setStructureOpen] = useState(false);
  const [componentForm] = Form.useForm<{ name: string; kind: ComponentKind }>();
  const [structureForm] = Form.useForm<{ name: string; componentIds: string[] }>();

  const saveNewComponent = async () => {
    let values: { name: string; kind: ComponentKind };
    try {
      values = await componentForm.validateFields();
    } catch {
      return;
    }
    saveComponent({ id: crypto.randomUUID(), name: values.name.trim(), kind: values.kind });
    setComponentOpen(false);
  };

  const saveNewStructure = async () => {
    let values: { name: string; componentIds: string[] };
    try {
      values = await structureForm.validateFields();
    } catch {
      return;
    }
    const editing = structures[0];
    saveStructure({
      id: editing?.id ?? crypto.randomUUID(),
      name: values.name.trim(),
      componentIds: values.componentIds,
    });
    setStructureOpen(false);
  };

  const columns: TableProps<PayComponent>['columns'] = [
    { title: 'Component', dataIndex: 'name' },
    {
      title: 'Kind',
      dataIndex: 'kind',
      width: 140,
      render: (kind: ComponentKind) => <Tag color={kind === 'Earning' ? 'green' : 'red'}>{kind}</Tag>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Salary structures"
        subtitle="Components and the monthly structure used by the sample payroll run."
        actions={
          <Button
            type="primary"
            onClick={() => {
              componentForm.resetFields();
              componentForm.setFieldsValue({ kind: 'Earning' });
              setComponentOpen(true);
            }}
          >
            Add component
          </Button>
        }
      />
      <SampleDataNotice />
      <Card title="Components" styles={{ body: { padding: 16 } }} style={{ marginBottom: 16 }}>
        <Table<PayComponent> rowKey="id" columns={columns} dataSource={components} pagination={false} />
      </Card>
      <Card
        title="Structures"
        styles={{ body: { padding: 16 } }}
        extra={
          <Button
            onClick={() => {
              const structure = structures[0];
              structureForm.setFieldsValue({
                name: structure?.name ?? '',
                componentIds: structure?.componentIds ?? [],
              });
              setStructureOpen(true);
            }}
          >
            Edit structure
          </Button>
        }
      >
        <Table<SalaryStructure>
          rowKey="id"
          pagination={false}
          dataSource={structures}
          columns={[
            { title: 'Name', dataIndex: 'name' },
            {
              title: 'Components',
              dataIndex: 'componentIds',
              render: (ids: string[]) => ids.map((id) => components.find((item) => item.id === id)?.name ?? id).join(', '),
            },
          ]}
        />
      </Card>
      <FormDrawer open={componentOpen} title="Add component" onClose={() => setComponentOpen(false)} onSubmit={() => void saveNewComponent()}>
        <Form form={componentForm} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Enter a name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="kind" label="Kind" rules={[{ required: true }]}>
            <Select options={[{ value: 'Earning', label: 'Earning' }, { value: 'Deduction', label: 'Deduction' }]} />
          </Form.Item>
        </Form>
      </FormDrawer>
      <FormDrawer open={structureOpen} title="Edit structure" onClose={() => setStructureOpen(false)} onSubmit={() => void saveNewStructure()}>
        <Form form={structureForm} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Enter a name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="componentIds" label="Components" rules={[{ required: true, message: 'Choose components' }]}>
            <Select mode="multiple" options={components.map((item) => ({ value: item.id, label: item.name }))} />
          </Form.Item>
        </Form>
      </FormDrawer>
    </>
  );
}
