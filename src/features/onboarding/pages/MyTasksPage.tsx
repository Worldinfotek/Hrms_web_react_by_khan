import { Button, Card, Select, Table, Tag, Typography } from 'antd';
import type { TableProps } from 'antd';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { useOnboardingStore } from '../store';
import { TASK_OWNERS, type TaskOwner } from '../types';

interface TaskRow {
  key: string;
  joinerId: string;
  joinerName: string;
  taskId: string;
  name: string;
  owner: TaskOwner;
  done: boolean;
}

export default function MyTasksPage() {
  const navigate = useNavigate();
  const joiners = useOnboardingStore((state) => state.joiners);
  const completeTask = useOnboardingStore((state) => state.completeTask);
  const [owner, setOwner] = useState<TaskOwner>('IT');
  const rows = useMemo(() => {
    const list: TaskRow[] = [];
    for (const joiner of joiners) {
      for (const task of joiner.tasks) {
        if (task.owner !== owner) continue;
        list.push({
          key: `${joiner.id}-${task.id}`,
          joinerId: joiner.id,
          joinerName: joiner.name,
          taskId: task.id,
          name: task.name,
          owner: task.owner,
          done: task.done,
        });
      }
    }
    return list.sort((a, b) => Number(a.done) - Number(b.done));
  }, [joiners, owner]);

  const columns: TableProps<TaskRow>['columns'] = [
    { title: 'Task', dataIndex: 'name' },
    {
      title: 'Joiner',
      dataIndex: 'joinerName',
      render: (name: string, row) => (
        <Button type="link" style={{ padding: 0 }} onClick={() => navigate(`/onboarding/${row.joinerId}`)}>
          {name}
        </Button>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'done',
      width: 120,
      render: (done: boolean) => <Tag color={done ? 'green' : 'gold'}>{done ? 'Done' : 'Open'}</Tag>,
    },
    {
      title: '',
      key: 'action',
      width: 120,
      render: (_, row) =>
        row.done ? (
          <Typography.Text type="secondary">Closed</Typography.Text>
        ) : (
          <Button size="small" type="primary" onClick={() => completeTask(row.joinerId, row.taskId)}>
            Complete
          </Button>
        ),
    },
  ];

  return (
    <>
      <PageHeader title="Onboarding checklist" subtitle="Tasks for one owner across joiners. IT and Admin are the usual checks." />
      <SampleDataNotice />
      <Card styles={{ body: { padding: 16 } }} style={{ marginBottom: 16 }}>
        <Select
          style={{ minWidth: 200 }}
          value={owner}
          onChange={setOwner}
          options={TASK_OWNERS.map((value) => ({ value, label: value }))}
        />
      </Card>
      <Card styles={{ body: { padding: 16 } }}>
        <Table<TaskRow> rowKey="key" columns={columns} dataSource={rows} pagination={false} />
      </Card>
    </>
  );
}
