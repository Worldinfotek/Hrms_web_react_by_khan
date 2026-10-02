import { Card, Flex, Select, Tag, Typography } from 'antd';
import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { useRecruitmentStore } from '../store';
import { PIPELINE_STAGES, type PipelineStage } from '../types';

export default function PipelinePage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const vacancies = useRecruitmentStore((state) => state.vacancies);
  const candidates = useRecruitmentStore((state) => state.candidates);
  const moveCandidate = useRecruitmentStore((state) => state.moveCandidate);
  const vacancyId = params.get('vacancy') ?? vacancies[0]?.id ?? '';
  const vacancy = vacancies.find((item) => item.id === vacancyId) ?? vacancies[0];
  const rows = useMemo(
    () => candidates.filter((item) => item.vacancyId === (vacancy?.id ?? '')),
    [candidates, vacancy?.id],
  );

  return (
    <>
      <PageHeader
        title="Candidate pipeline"
        subtitle={vacancy ? `${vacancy.title} · ${vacancy.department} · ${vacancy.hiringManager}` : 'No vacancy yet'}
      />
      <SampleDataNotice />
      <Card styles={{ body: { padding: 16 } }} style={{ marginBottom: 16 }}>
        <Select
          style={{ minWidth: 280 }}
          value={vacancy?.id}
          onChange={(value) => setParams({ vacancy: value })}
          options={vacancies.map((item) => ({ value: item.id, label: `${item.title} (${item.status})` }))}
        />
      </Card>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
        {PIPELINE_STAGES.map((stage) => (
          <StageColumn
            key={stage}
            stage={stage}
            names={rows.filter((item) => item.stage === stage)}
            onDropCandidate={(id) => moveCandidate(id, stage)}
            onOpen={(id) => navigate(`/recruitment/candidates/${id}`)}
          />
        ))}
      </div>
    </>
  );
}

function StageColumn({
  stage,
  names,
  onDropCandidate,
  onOpen,
}: {
  stage: PipelineStage;
  names: { id: string; name: string; email: string }[];
  onDropCandidate: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const id = event.dataTransfer.getData('text/plain');
        if (id) onDropCandidate(id);
      }}
      style={{
        flex: '0 0 210px',
        background: '#F4F8FB',
        borderRadius: 8,
        padding: 10,
        minHeight: 280,
      }}
    >
      <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
        <Typography.Text strong>{stage}</Typography.Text>
        <Tag>{names.length}</Tag>
      </Flex>
      <Flex vertical gap={8}>
        {names.map((item) => (
          <Card
            key={item.id}
            size="small"
            hoverable
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData('text/plain', item.id);
              event.dataTransfer.effectAllowed = 'move';
            }}
            onClick={() => onOpen(item.id)}
            styles={{ body: { padding: 10, cursor: 'grab' } }}
          >
            <div>{item.name}</div>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {item.email}
            </Typography.Text>
          </Card>
        ))}
      </Flex>
    </div>
  );
}
