import { Button, Card, Form, Input, InputNumber, Select, Space, Table, Typography } from 'antd';
import type { TableProps } from 'antd';
import { useState } from 'react';
import { FormDrawer, PageHeader } from '@/shared/components';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { useOnboardingStore } from '../store';
import { TASK_OWNERS, type OnboardingTemplate, type TaskOwner } from '../types';

interface TemplateForm {
  name: string;
  department: string;
  designation: string;
  employmentType: string;
}

interface DraftTask {
  id: string;
  name: string;
  owner: TaskOwner;
  dueDay: number;
}

export default function OnboardingTemplatesPage() {
  const templates = useOnboardingStore((state) => state.templates);
  const saveTemplate = useOnboardingStore((state) => state.saveTemplate);
  const [editing, setEditing] = useState<OnboardingTemplate | 'new' | null>(null);
  const [tasks, setTasks] = useState<DraftTask[]>([]);
  const [form] = Form.useForm<TemplateForm>();

  const open = (template: OnboardingTemplate | 'new') => {
    if (template === 'new') {
      form.resetFields();
      form.setFieldsValue({ department: 'Technology', employmentType: 'Permanent' });
      setTasks([{ id: crypto.randomUUID(), name: '', owner: 'HR', dueDay: 0 }]);
    } else {
      form.setFieldsValue(template);
      setTasks(template.tasks.map((task) => ({ ...task })));
    }
    setEditing(template);
  };

  const onSubmit = async () => {
    let values: TemplateForm;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    const cleaned = tasks.filter((task) => task.name.trim());
    if (cleaned.length === 0) return;
    saveTemplate({
      id: editing && editing !== 'new' ? editing.id : crypto.randomUUID(),
      name: values.name.trim(),
      department: values.department.trim(),
      designation: values.designation.trim(),
      employmentType: values.employmentType.trim(),
      tasks: cleaned.map((task) => ({
        id: task.id,
        name: task.name.trim(),
        owner: task.owner,
        dueDay: task.dueDay,
      })),
    });
    setEditing(null);
  };

  const columns: TableProps<OnboardingTemplate>['columns'] = [
    { title: 'Template', dataIndex: 'name' },
    { title: 'Department', dataIndex: 'department' },
    { title: 'Designation', dataIndex: 'designation' },
    { title: 'Employment type', dataIndex: 'employmentType' },
    { title: 'Tasks', key: 'count', width: 80, render: (_, row) => row.tasks.length },
    {
      title: '',
      key: 'edit',
      width: 80,
      render: (_, row) => (
        <Button size="small" onClick={() => open(row)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Onboarding templates"
        subtitle="Tasks by department, designation, and employment type. Each task has an owner and a due day."
        actions={
          <Button type="primary" onClick={() => open('new')}>
            Add template
          </Button>
        }
      />
      <SampleDataNotice />
      <Card styles={{ body: { padding: 16 } }}>
        <Table<OnboardingTemplate> rowKey="id" columns={columns} dataSource={templates} pagination={false} />
      </Card>
      <FormDrawer open={editing !== null} title={editing === 'new' ? 'Add template' : 'Edit template'} onClose={() => setEditing(null)} onSubmit={() => void onSubmit()} width={640}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Enter a name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="department" label="Department" rules={[{ required: true, message: 'Enter a department' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="designation" label="Designation" rules={[{ required: true, message: 'Enter a designation' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="employmentType" label="Employment type" rules={[{ required: true, message: 'Enter an employment type' }]}>
            <Input />
          </Form.Item>
        </Form>
        <Typography.Text strong>Tasks</Typography.Text>
        {tasks.map((task) => (
          <Space key={task.id} style={{ display: 'flex', marginTop: 8 }} align="start">
            <Input
              placeholder="Task"
              value={task.name}
              onChange={(event) =>
                setTasks((current) => current.map((item) => (item.id === task.id ? { ...item, name: event.target.value } : item)))
              }
            />
            <Select
              style={{ width: 130 }}
              value={task.owner}
              options={TASK_OWNERS.map((value) => ({ value, label: value }))}
              onChange={(owner) => setTasks((current) => current.map((item) => (item.id === task.id ? { ...item, owner } : item)))}
            />
            <InputNumber
              min={0}
              value={task.dueDay}
              addonBefore="Day"
              onChange={(dueDay) =>
                setTasks((current) => current.map((item) => (item.id === task.id ? { ...item, dueDay: dueDay ?? 0 } : item)))
              }
            />
          </Space>
        ))}
        <Button
          style={{ marginTop: 12 }}
          onClick={() => setTasks((current) => [...current, { id: crypto.randomUUID(), name: '', owner: 'HR', dueDay: 0 }])}
        >
          Add task
        </Button>
      </FormDrawer>
    </>
  );
}
