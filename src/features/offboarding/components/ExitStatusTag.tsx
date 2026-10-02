import { Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useOffboardingStore } from '../store';
import { exitStage, isExited } from '../types';

export function ExitStatusTag({
  employeeCode,
  status,
  color,
}: {
  employeeCode: string;
  status: string;
  color: string;
}) {
  const cases = useOffboardingStore((state) => state.cases);
  const item = cases.find((row) => row.employeeCode === employeeCode);
  if (!item) return <Tag color={color}>{status}</Tag>;
  if (isExited(item)) {
    return (
      <>
        <Tag>Exited</Tag>
        <Typography.Text type="secondary">Sample status. The directory still says {status}.</Typography.Text>
        <Link to={`/offboarding/${item.id}`}>Open exit</Link>
      </>
    );
  }
  return (
    <>
      <Tag color={color}>{status}</Tag>
      <Tag color="gold">{exitStage(item)}</Tag>
      <Link to={`/offboarding/${item.id}`}>Open exit</Link>
    </>
  );
}
