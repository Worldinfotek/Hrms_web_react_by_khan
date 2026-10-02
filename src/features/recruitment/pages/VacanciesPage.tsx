import { Button, Card, Form, Input, InputNumber, Select, Table, Tag, Typography } from 'antd';
import type { TableProps } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormDrawer, PageHeader } from '@/shared/components';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { useRecruitmentStore } from '../store';
import type { Vacancy, VacancyStatus } from '../types';

interface VacancyForm {
  title: string;
  department: string;
  designation: string;
  experience: string;
  education: string;
  skills: string;
  openings: number;
  hiringManager: string;
  status: VacancyStatus;
}

const statusColor: Record<VacancyStatus, string> = { Open: 'green', 'On hold': 'gold', Closed: 'default' };

export default function VacanciesPage() {
  const navigate = useNavigate();
  const vacancies = useRecruitmentStore((state) => state.vacancies);
  const candidates = useRecruitmentStore((state) => state.candidates);
  const saveVacancy = useRecruitmentStore((state) => state.saveVacancy);
  const [editing, setEditing] = useState<Vacancy | 'new' | null>(null);
  const [form] = Form.useForm<VacancyForm>();

  const open = (vacancy: Vacancy | 'new') => {
    if (vacancy === 'new') {
      form.resetFields();
      form.setFieldsValue({ openings: 1, status: 'Open', department: 'Technology' });
    } else {
      form.setFieldsValue(vacancy);
    }
    setEditing(vacancy);
  };

  const onSubmit = async () => {
    let values: VacancyForm;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    saveVacancy({
      id: editing && editing !== 'new' ? editing.id : crypto.randomUUID(),
      title: values.title.trim(),
      department: values.department.trim(),
      designation: values.designation.trim(),
      experience: values.experience.trim(),
      education: values.education.trim(),
      skills: values.skills.trim(),
      openings: values.openings,
      hiringManager: values.hiringManager.trim(),
      status: values.status,
    });
    setEditing(null);
  };

  const columns: TableProps<Vacancy>['columns'] = [
    { title: 'Title', dataIndex: 'title' },
    { title: 'Department', dataIndex: 'department' },
    { title: 'Designation', dataIndex: 'designation' },
    { title: 'Openings', dataIndex: 'openings', width: 100 },
    { title: 'Hiring manager', dataIndex: 'hiringManager' },
    {
      title: 'Candidates',
      key: 'count',
      width: 110,
      render: (_, row) => candidates.filter((item) => item.vacancyId === row.id).length,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 110,
      render: (value: VacancyStatus) => <Tag color={statusColor[value]}>{value}</Tag>,
    },
    {
      title: '',
      key: 'actions',
      width: 180,
      render: (_, row) => (
        <>
          <Button size="small" type="link" onClick={() => navigate(`/recruitment/pipeline?vacancy=${row.id}`)}>
            Pipeline
          </Button>
          <Button size="small" type="link" onClick={() => open(row)}>
            Edit
          </Button>
        </>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Job vacancies"
        subtitle="One open role. Open the pipeline to move candidates."
        actions={
          <Button type="primary" onClick={() => open('new')}>
            Add vacancy
          </Button>
        }
      />
      <SampleDataNotice />
      <Card styles={{ body: { padding: 16 } }}>
        <Table<Vacancy>
          rowKey="id"
          columns={columns}
          dataSource={vacancies}
          pagination={false}
          expandable={{
            expandedRowRender: (row) => (
              <Typography.Paragraph style={{ marginBottom: 0 }}>
                Experience {row.experience}. Education {row.education}. Skills {row.skills}.
              </Typography.Paragraph>
            ),
          }}
        />
      </Card>
      <FormDrawer
        open={editing !== null}
        title={editing === 'new' ? 'Add vacancy' : 'Edit vacancy'}
        onClose={() => setEditing(null)}
        onSubmit={() => void onSubmit()}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Enter a title' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="department" label="Department" rules={[{ required: true, message: 'Enter a department' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="designation" label="Designation" rules={[{ required: true, message: 'Enter a designation' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="experience" label="Experience" rules={[{ required: true, message: 'Enter experience' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="education" label="Education" rules={[{ required: true, message: 'Enter education' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="skills" label="Skills" rules={[{ required: true, message: 'Enter skills' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="openings" label="Openings" rules={[{ required: true, message: 'Enter openings' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="hiringManager" label="Hiring manager" rules={[{ required: true, message: 'Enter a hiring manager' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select options={(['Open', 'On hold', 'Closed'] as VacancyStatus[]).map((value) => ({ value, label: value }))} />
          </Form.Item>
        </Form>
      </FormDrawer>
    </>
  );
}
