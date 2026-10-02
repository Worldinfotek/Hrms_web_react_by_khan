import { Descriptions, Table, Tag, Typography } from 'antd';
import type { TableProps } from 'antd';
import { useMemo } from 'react';
import { formatDate } from '@/shared/utils/format';
import { balanceOf, useLeaveStore } from '../store';
import { remaining, type LeaveRequest } from '../types';

export function EmployeeLeaveTab({ employeeCode }: { employeeCode: string }) {
  const types = useLeaveStore((state) => state.types);
  const balances = useLeaveStore((state) => state.balances);
  const requests = useLeaveStore((state) => state.requests);
  const mine = useMemo(() => requests.filter((item) => item.employeeCode === employeeCode), [requests, employeeCode]);
  const active = types.filter((type) => type.isActive);

  const columns: TableProps<LeaveRequest>['columns'] = [
    {
      title: 'Type',
      dataIndex: 'leaveTypeId',
      render: (id: string) => types.find((type) => type.id === id)?.name ?? id,
    },
    {
      title: 'Dates',
      key: 'dates',
      render: (_, row) => (row.start === row.end ? formatDate(row.start) : `${formatDate(row.start)} – ${formatDate(row.end)}`),
    },
    { title: 'Days', dataIndex: 'days', width: 80 },
    {
      title: 'Decision',
      dataIndex: 'decision',
      width: 120,
      render: (value: LeaveRequest['decision']) => (
        <Tag color={value === 'Approved' ? 'green' : value === 'Rejected' ? 'red' : 'gold'}>{value}</Tag>
      ),
    },
  ];

  return (
    <>
      <Descriptions size="small" column={2} bordered style={{ marginBottom: 16 }}>
        {active.map((type) => {
          const balance = balanceOf(balances, employeeCode, type);
          return (
            <Descriptions.Item key={type.id} label={type.name}>
              {remaining(balance)} left · {balance.taken} taken
            </Descriptions.Item>
          );
        })}
      </Descriptions>
      {mine.length === 0 ? (
        <Typography.Text type="secondary">No leave requests for this employee.</Typography.Text>
      ) : (
        <Table<LeaveRequest> rowKey="id" columns={columns} dataSource={mine} pagination={false} />
      )}
    </>
  );
}
