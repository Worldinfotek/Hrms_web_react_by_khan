import { Button, Card, Descriptions, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { usePayrollStore } from '../store';
import { lineNet } from '../types';

export function EmployeeSalaryTab({ employeeCode }: { employeeCode: string }) {
  const access = usePayrollStore((state) => state.payrollAccess);
  const grantAccess = usePayrollStore((state) => state.grantAccess);
  const components = usePayrollStore((state) => state.components);
  const structures = usePayrollStore((state) => state.structures);
  const runs = usePayrollStore((state) => state.runs);
  const current = runs.find((run) => run.id === 'run-current');
  const person = current?.employees.find((item) => item.employeeCode === employeeCode);

  if (!access) {
    return (
      <Card>
        <Typography.Title level={5}>Payroll access is required</Typography.Title>
        <Typography.Paragraph>
          Salary amounts stay hidden until payroll access is turned on for this browser. Other people cannot see this from employee self-service.
        </Typography.Paragraph>
        <Button type="primary" onClick={() => grantAccess()}>
          View with payroll access
        </Button>
      </Card>
    );
  }

  if (!person || !current) {
    return <Typography.Text type="secondary">This person has no salary in the sample payroll.</Typography.Text>;
  }

  return (
    <>
      <Descriptions size="small" bordered column={1} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Structure">{structures[0]?.name ?? 'Monthly staff'}</Descriptions.Item>
        <Descriptions.Item label="Run">{current.label}</Descriptions.Item>
        <Descriptions.Item label="Net">{lineNet(person.lines, components).toLocaleString()}</Descriptions.Item>
      </Descriptions>
      {person.lines.map((line) => {
        const component = components.find((item) => item.id === line.componentId);
        return (
          <div key={line.componentId}>
            <Typography.Text>
              {component?.name ?? line.componentId}: {line.amount.toLocaleString()}
            </Typography.Text>
            {line.note ? <Typography.Text type="secondary"> — {line.note}</Typography.Text> : null}
          </div>
        );
      })}
      <div style={{ marginTop: 12 }}>
        <Link to={`/payroll/runs/${current.id}/${employeeCode}`}>Open payslip</Link>
      </div>
    </>
  );
}
