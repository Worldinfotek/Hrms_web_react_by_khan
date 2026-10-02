import { Descriptions, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { formatDate } from '@/shared/utils/format';
import { useProbationStore } from '../store';

export function ProbationProfileNote({ employeeCode }: { employeeCode: string }) {
  const cases = useProbationStore((state) => state.cases);
  const item = cases.find((row) => row.employeeCode === employeeCode);
  if (!item || item.outcome === 'Awaiting') return null;

  return (
    <Descriptions size="small" bordered column={1} style={{ marginBottom: 16 }} title="Probation sample">
      <Descriptions.Item label="Outcome">
        <Tag color={item.outcome === 'Confirmed' ? 'green' : item.outcome === 'Extended' ? 'gold' : 'red'}>{item.outcome}</Tag>
      </Descriptions.Item>
      {item.confirmationDate && (
        <Descriptions.Item label="Confirmation date">{formatDate(item.confirmationDate)}</Descriptions.Item>
      )}
      {item.extendedEnd && <Descriptions.Item label="Probation end">{formatDate(item.extendedEnd)}</Descriptions.Item>}
      {item.decisionComment && (
        <Descriptions.Item label="Note">
          <Typography.Text>{item.decisionComment}</Typography.Text>
        </Descriptions.Item>
      )}
      <Descriptions.Item label="Review">
        <Link to={`/probation/${item.employeeCode}`}>Open the probation review</Link>
      </Descriptions.Item>
    </Descriptions>
  );
}
