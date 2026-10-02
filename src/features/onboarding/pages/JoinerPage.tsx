import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Col, List, Progress, Row, Tag, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components';
import { formatDate } from '@/shared/utils/format';
import dayjs from 'dayjs';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { useOnboardingStore } from '../store';
import { progressPercent } from '../types';

export default function JoinerPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const joiners = useOnboardingStore((state) => state.joiners);
  const completeTask = useOnboardingStore((state) => state.completeTask);
  const acknowledgePolicy = useOnboardingStore((state) => state.acknowledgePolicy);
  const toggleOrientation = useOnboardingStore((state) => state.toggleOrientation);
  const markDocument = useOnboardingStore((state) => state.markDocument);
  const joiner = joiners.find((item) => item.id === id);

  if (!joiner) {
    return (
      <>
        <PageHeader title="Joiner" />
        <Button onClick={() => navigate('/onboarding')}>Back to onboarding</Button>
      </>
    );
  }

  const percent = progressPercent(joiner);

  return (
    <>
      <PageHeader
        title={joiner.name}
        subtitle={`${joiner.designation} · ${joiner.department} · started ${formatDate(joiner.startDate)}`}
        actions={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/onboarding')}>
            Dashboard
          </Button>
        }
      />
      <SampleDataNotice />
      <Progress percent={percent} style={{ marginBottom: 16 }} />
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Tasks" styles={{ body: { padding: 16 } }}>
            <List
              dataSource={joiner.tasks}
              renderItem={(task) => (
                <List.Item
                  actions={[
                    task.done ? (
                      <Tag color="green" key="done">Done</Tag>
                    ) : (
                      <Button key="done" size="small" type="primary" onClick={() => completeTask(joiner.id, task.id)}>
                        Complete
                      </Button>
                    ),
                  ]}
                >
                  <List.Item.Meta
                    title={task.name}
                    description={`${task.owner} · due ${formatDate(dayjs(joiner.startDate).add(task.dueDay, 'day').format('YYYY-MM-DD'))}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Documents still required" styles={{ body: { padding: 16 } }} style={{ marginBottom: 16 }}>
            <List
              dataSource={joiner.documents}
              renderItem={(doc) => (
                <List.Item
                  actions={[
                    doc.received ? (
                      <Tag color="green" key="in">Received</Tag>
                    ) : (
                      <Button key="in" size="small" onClick={() => markDocument(joiner.id, doc.name)}>
                        Mark received
                      </Button>
                    ),
                  ]}
                >
                  {doc.name}
                </List.Item>
              )}
            />
          </Card>
          <Card title="Policy acknowledgement" styles={{ body: { padding: 16 } }} style={{ marginBottom: 16 }}>
            {joiner.policyAcknowledged ? (
              <Tag color="green">Acknowledged</Tag>
            ) : (
              <>
                <Typography.Paragraph>The joiner has not acknowledged the company policies.</Typography.Paragraph>
                <Button type="primary" onClick={() => acknowledgePolicy(joiner.id)}>
                  Mark acknowledged
                </Button>
              </>
            )}
          </Card>
          <Card title="Orientation" styles={{ body: { padding: 16 } }}>
            <List
              dataSource={joiner.orientation}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button key="toggle" size="small" onClick={() => toggleOrientation(joiner.id, item.id)}>
                      {item.done ? 'Reopen' : 'Complete'}
                    </Button>,
                  ]}
                >
                  {item.name} {item.done ? <Tag color="green">Done</Tag> : <Tag>Open</Tag>}
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}
