import { App, Button, Card, Flex, Table, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useAttendanceStore } from '@/features/attendance/store';
import { useEssStore } from '@/features/ess/store';
import { useLeaveStore } from '@/features/leave/store';
import { useProbationStore } from '@/features/probation/store';
import { PageHeader } from '@/shared/components';
import { formatDate } from '@/shared/utils/format';
import { ManagerViewGate } from '../components/ManagerViewGate';
import { TEAM_CODES } from '../team';

export default function ManagerInboxPage() {
  const { message } = App.useApp();
  const requests = useLeaveStore((state) => state.requests);
  const types = useLeaveStore((state) => state.types);
  const decide = useLeaveStore((state) => state.decide);
  const corrections = useAttendanceStore((state) => state.corrections);
  const decideCorrection = useAttendanceStore((state) => state.decideCorrection);
  const hrRequests = useEssStore((state) => state.requests);
  const decideRequest = useEssStore((state) => state.decideRequest);
  const cases = useProbationStore((state) => state.cases);
  const pendingLeave = requests.filter((item) => item.decision === 'Pending');
  const pendingCorrections = corrections.filter((item) => item.decision === 'Pending');
  const pendingHr = hrRequests.filter((item) => item.status === 'Pending');
  const probation = cases.filter((item) => TEAM_CODES.includes(item.employeeCode) && item.outcome === 'Awaiting');

  return (
    <>
      <PageHeader
        title="Approvals inbox"
        subtitle="Leave and attendance corrections update those screens when you approve them."
      />
      <ManagerViewGate>
        <Card title="Leave" styles={{ body: { padding: 16 } }} style={{ marginBottom: 16 }}>
          <Table
            rowKey="id"
            pagination={false}
            dataSource={pendingLeave}
            locale={{ emptyText: 'No pending leave. Restore samples on the Leave screen if you already approved the sample.' }}
            columns={[
              { title: 'Employee', dataIndex: 'employeeName' },
              { title: 'Type', dataIndex: 'leaveTypeId', render: (id: string) => types.find((type) => type.id === id)?.name ?? id },
              { title: 'Dates', render: (_, row) => formatDate(row.start) },
              { title: 'Days', dataIndex: 'days', width: 80 },
              {
                title: '',
                width: 200,
                render: (_, row) => (
                  <Flex gap={8}>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => {
                        decide(row.id, true, 'Approved by manager');
                        message.success('Leave approved. The Leave screen and the attendance board are updated.');
                      }}
                    >
                      Approve
                    </Button>
                    <Button size="small" danger onClick={() => decide(row.id, false, 'Rejected by manager')}>
                      Reject
                    </Button>
                  </Flex>
                ),
              },
            ]}
          />
        </Card>
        <Card title="Attendance corrections" styles={{ body: { padding: 16 } }} style={{ marginBottom: 16 }}>
          <Table
            rowKey="id"
            pagination={false}
            dataSource={pendingCorrections}
            locale={{ emptyText: 'No pending correction. Restore samples on Attendance corrections if you already decided the sample.' }}
            columns={[
              { title: 'Employee', dataIndex: 'employeeName' },
              { title: 'Date', dataIndex: 'date', render: (value: string) => formatDate(value) },
              { title: 'Change', render: (_, row) => `${row.fromStatus} → ${row.toStatus}` },
              {
                title: '',
                width: 200,
                render: (_, row) => (
                  <Flex gap={8}>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => {
                        decideCorrection(row.id, true, 'Approved by manager');
                        message.success('Correction approved. The attendance day is updated.');
                      }}
                    >
                      Approve
                    </Button>
                    <Button size="small" danger onClick={() => decideCorrection(row.id, false, 'Rejected by manager')}>
                      Reject
                    </Button>
                  </Flex>
                ),
              },
            ]}
          />
        </Card>
        <Card title="HR requests" styles={{ body: { padding: 16 } }} style={{ marginBottom: 16 }}>
          <Table
            rowKey="id"
            pagination={false}
            dataSource={pendingHr}
            locale={{ emptyText: 'No HR request. Send one from Employee self-service.' }}
            columns={[
              { title: 'Type', dataIndex: 'kind' },
              { title: 'Detail', dataIndex: 'detail' },
              {
                title: '',
                width: 200,
                render: (_, row) => (
                  <Flex gap={8}>
                    <Button size="small" type="primary" onClick={() => decideRequest(row.id, true)}>
                      Approve
                    </Button>
                    <Button size="small" danger onClick={() => decideRequest(row.id, false)}>
                      Reject
                    </Button>
                  </Flex>
                ),
              },
            ]}
          />
        </Card>
        <Card title="Probation evaluation" styles={{ body: { padding: 16 } }}>
          {probation.length === 0 ? (
            <Typography.Text type="secondary">No one on this team is awaiting a probation decision.</Typography.Text>
          ) : (
            probation.map((item) => (
              <div key={item.employeeCode}>
                <Tag>{item.employeeName}</Tag>
                <Link to={`/probation/${item.employeeCode}`}>Open evaluation</Link>
              </div>
            ))
          )}
        </Card>
      </ManagerViewGate>
    </>
  );
}
