import { Button, Card, Form, Input, InputNumber, Select, Table, Typography } from 'antd';
import type { TableProps } from 'antd';
import { useMemo, useState } from 'react';
import { useEmployees } from '@/features/employees/api/employeesApi';
import { FormDrawer, PageHeader } from '@/shared/components';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { balanceOf, useLeaveStore } from '../store';
import { remaining, type LeaveAdjustment } from '../types';

interface AdjustForm {
  employeeCode: string;
  leaveTypeId: string;
  amount: number;
  reason: string;
}

interface BalanceRow {
  key: string;
  employeeCode: string;
  employeeName: string;
  leaveTypeId: string;
  typeName: string;
  allocated: number;
  taken: number;
  adjustment: number;
  remaining: number;
}

const fallbackPeople = [
  { employeeCode: 'WIT-0004', fullName: 'Bilal Ahmed' },
  { employeeCode: 'WIT-0002', fullName: 'Sana Tariq' },
];

export default function LeaveBalancesPage() {
  const employees = useEmployees({ page: 1, pageSize: 100, sortBy: 'fullName', sortOrder: 'asc' });
  const types = useLeaveStore((state) => state.types);
  const balances = useLeaveStore((state) => state.balances);
  const adjustments = useLeaveStore((state) => state.adjustments);
  const adjust = useLeaveStore((state) => state.adjust);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<AdjustForm>();
  const people = employees.data?.items ?? fallbackPeople;

  const rows = useMemo(() => {
    const list: BalanceRow[] = [];
    for (const person of people) {
      for (const type of types.filter((item) => item.isActive)) {
        const balance = balanceOf(balances, person.employeeCode, type);
        list.push({
          key: `${person.employeeCode}-${type.id}`,
          employeeCode: person.employeeCode,
          employeeName: person.fullName,
          leaveTypeId: type.id,
          typeName: type.name,
          allocated: balance.allocated,
          taken: balance.taken,
          adjustment: balance.adjustment,
          remaining: remaining(balance),
        });
      }
    }
    return list;
  }, [people, types, balances]);

  const onSubmit = async () => {
    let values: AdjustForm;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    const person = people.find((item) => item.employeeCode === values.employeeCode);
    adjust(values.employeeCode, person?.fullName ?? values.employeeCode, values.leaveTypeId, values.amount, values.reason.trim());
    setOpen(false);
  };

  const columns: TableProps<BalanceRow>['columns'] = [
    {
      title: 'Employee',
      dataIndex: 'employeeName',
      render: (name: string, row) => (
        <div>
          <div>{name}</div>
          <Typography.Text type="secondary">{row.employeeCode}</Typography.Text>
        </div>
      ),
    },
    { title: 'Type', dataIndex: 'typeName', width: 120 },
    { title: 'Allocated', dataIndex: 'allocated', width: 110 },
    { title: 'Taken', dataIndex: 'taken', width: 90 },
    { title: 'Adjustment', dataIndex: 'adjustment', width: 120 },
    { title: 'Remaining', dataIndex: 'remaining', width: 110 },
  ];

  return (
    <>
      <PageHeader
        title="Leave balances"
        subtitle="Remaining is allocated minus taken, plus any HR adjustment."
        actions={
          <Button
            type="primary"
            onClick={() => {
              form.resetFields();
              setOpen(true);
            }}
          >
            Adjust
          </Button>
        }
      />
      <SampleDataNotice />
      <Card styles={{ body: { padding: 16 } }}>
        <Table<BalanceRow> rowKey="key" columns={columns} dataSource={rows} pagination={{ pageSize: 12 }} />
      </Card>
      {adjustments.length > 0 && (
        <Card title="Adjustments" styles={{ body: { padding: 16 } }} style={{ marginTop: 16 }}>
          <Table<LeaveAdjustment>
            rowKey="id"
            pagination={false}
            dataSource={adjustments}
            columns={[
              { title: 'Employee', dataIndex: 'employeeName' },
              {
                title: 'Type',
                dataIndex: 'leaveTypeId',
                render: (id: string) => types.find((type) => type.id === id)?.name ?? id,
              },
              { title: 'Amount', dataIndex: 'amount', width: 100 },
              { title: 'Reason', dataIndex: 'reason' },
            ]}
          />
        </Card>
      )}
      <FormDrawer open={open} title="Adjust balance" onClose={() => setOpen(false)} onSubmit={() => void onSubmit()}>
        <Form form={form} layout="vertical">
          <Form.Item name="employeeCode" label="Employee" rules={[{ required: true, message: 'Choose an employee' }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={people.map((item) => ({
                value: item.employeeCode,
                label: `${item.fullName} (${item.employeeCode})`,
              }))}
            />
          </Form.Item>
          <Form.Item name="leaveTypeId" label="Leave type" rules={[{ required: true, message: 'Choose a type' }]}>
            <Select options={types.filter((type) => type.isActive).map((type) => ({ value: type.id, label: type.name }))} />
          </Form.Item>
          <Form.Item name="amount" label="Days to add or remove" rules={[{ required: true, message: 'Enter an amount' }]} extra="Use a negative number to remove days.">
            <InputNumber style={{ width: '100%' }} step={0.5} />
          </Form.Item>
          <Form.Item name="reason" label="Reason" rules={[{ required: true, message: 'Enter a reason' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </FormDrawer>
    </>
  );
}
