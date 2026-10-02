import {
  AppstoreOutlined,
  DownloadOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  Col,
  Dropdown,
  Empty,
  Flex,
  Input,
  Pagination,
  Row,
  Segmented,
  Select,
  Spin,
  Switch,
  Tag,
  Typography,
} from 'antd';
import type { TableProps } from 'antd';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { DataTable, PageHeader } from '@/shared/components';
import { Permissions } from '@/shared/auth/permissions';
import { usePermission } from '@/shared/auth/usePermission';
import { useTableQuery } from '@/shared/hooks/useTableQuery';
import { toOptions, useLookups } from '@/shared/lookups/useLookups';
import { getErrorMessage } from '@/shared/utils/errors';
import { formatDate } from '@/shared/utils/format';
import { downloadFile, useEmployees } from '../api/employeesApi';
import { EmployeeAvatar } from '../components/EmployeeAvatar';
import { EmployeeCard } from '../components/EmployeeCard';
import type { EmployeeListItem } from '../types';

type Filters = {
  departmentId?: number;
  branchId?: number;
  designationId?: number;
  employeeStatusId?: number;
  employmentTypeId?: number;
  includeSeparated?: boolean;
};

export default function EmployeesPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [params, setParams] = useSearchParams();
  const view = params.get('view') === 'cards' ? 'cards' : 'table';
  const canCreate = usePermission(Permissions.Employees.Create);
  const canImport = usePermission(Permissions.Employees.Import);
  const canExport = usePermission(Permissions.Employees.Export);

  const { query, updateQuery } = useTableQuery({ sortBy: 'fullName', sortOrder: 'asc' });
  const [filters, setFilters] = useState<Filters>({});
  const listQuery = { ...query, ...filters, pageSize: view === 'cards' ? 24 : query.pageSize };
  const employees = useEmployees(listQuery);
  const lookups = useLookups([
    'departments',
    'branches',
    'designations',
    'employeeStatuses',
    'employmentTypes',
  ]);
  const [exporting, setExporting] = useState(false);

  const setFilter = (patch: Filters) => {
    setFilters((current) => ({ ...current, ...patch }));
    updateQuery({ page: 1 });
  };

  const exportAs = async (format: 'xlsx' | 'csv') => {
    setExporting(true);
    try {
      const rest: Record<string, unknown> = { ...listQuery };
      delete rest.page;
      delete rest.pageSize;
      const file = await downloadFile('/employees/export', { ...rest, format }, `employees.${format}`);
      message.success(`Downloaded ${file}`);
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setExporting(false);
    }
  };

  const columns: TableProps<EmployeeListItem>['columns'] = [
    {
      title: 'Employee',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: (_, e) => (
        <Flex gap={10} align="center">
          <EmployeeAvatar id={e.id} name={e.fullName} hasPhoto={e.hasPhoto} />
          <Flex vertical>
            <Link to={`/employees/${e.id}`} onClick={(ev) => ev.stopPropagation()}>
              <Typography.Text strong>{e.fullName}</Typography.Text>
            </Link>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {e.employeeCode}
              {e.workEmail ? ` · ${e.workEmail}` : ''}
            </Typography.Text>
          </Flex>
        </Flex>
      ),
    },
    { title: 'Designation', dataIndex: 'designation', key: 'designation', sorter: true },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      sorter: true,
      render: (_, e) => (
        <Flex vertical>
          <span>{e.department}</span>
          {e.team && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {e.team}
            </Typography.Text>
          )}
        </Flex>
      ),
    },
    { title: 'Branch', dataIndex: 'branch', key: 'branch', sorter: true, responsive: ['lg'] },
    {
      title: 'Reports to',
      dataIndex: 'reportingManager',
      key: 'reportingManager',
      responsive: ['xl'],
      render: (v) => v ?? '—',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: (_, e) => <Tag color={e.statusColor}>{e.status}</Tag>,
    },
    {
      title: 'Joined',
      dataIndex: 'joiningDate',
      key: 'joiningDate',
      sorter: true,
      render: (v: string) => formatDate(v),
    },
    {
      title: 'Login',
      dataIndex: 'hasLogin',
      key: 'hasLogin',
      responsive: ['xl'],
      render: (v: boolean) => (v ? <UserOutlined title="Has a login account" /> : null),
    },
  ];

  const filterBar = (
    <>
      <Select
        allowClear
        showSearch={{ optionFilterProp: 'label' }}
        placeholder="Department"
        style={{ width: 180 }}
        value={filters.departmentId}
        onChange={(v) => setFilter({ departmentId: v })}
        options={toOptions(lookups.data?.departments)}
      />
      <Select
        allowClear
        showSearch={{ optionFilterProp: 'label' }}
        placeholder="Designation"
        style={{ width: 170 }}
        value={filters.designationId}
        onChange={(v) => setFilter({ designationId: v })}
        options={toOptions(lookups.data?.designations)}
      />
      <Select
        allowClear
        placeholder="Branch"
        style={{ width: 150 }}
        value={filters.branchId}
        onChange={(v) => setFilter({ branchId: v })}
        options={toOptions(lookups.data?.branches)}
      />
      <Select
        allowClear
        placeholder="Status"
        style={{ width: 150 }}
        value={filters.employeeStatusId}
        onChange={(v) => setFilter({ employeeStatusId: v })}
        options={(lookups.data?.employeeStatuses ?? []).map((s) => ({
          value: s.id,
          label: <Tag color={s.color ?? undefined}>{s.name}</Tag>,
        }))}
      />
      <Select
        allowClear
        placeholder="Type"
        style={{ width: 140 }}
        value={filters.employmentTypeId}
        onChange={(v) => setFilter({ employmentTypeId: v })}
        options={toOptions(lookups.data?.employmentTypes)}
      />
      <Flex gap={6} align="center">
        <Switch
          size="small"
          checked={!!filters.includeSeparated}
          onChange={(v) => setFilter({ includeSeparated: v || undefined })}
        />
        <Typography.Text type="secondary">Include ex-employees</Typography.Text>
      </Flex>
    </>
  );

  return (
    <>
      <PageHeader
        title="Employee directory"
        subtitle={`${employees.data?.meta.totalCount ?? 0} employee(s) · the single source of truth for every HR module`}
        actions={
          <>
            <Segmented
              value={view}
              onChange={(v) => setParams(v === 'cards' ? { view: 'cards' } : {}, { replace: true })}
              options={[
                { value: 'table', icon: <UnorderedListOutlined />, label: 'List' },
                { value: 'cards', icon: <AppstoreOutlined />, label: 'Directory' },
              ]}
            />
            {canExport && (
              <Dropdown
                menu={{
                  items: [
                    { key: 'xlsx', label: 'Excel (.xlsx)' },
                    { key: 'csv', label: 'CSV (.csv)' },
                  ],
                  onClick: ({ key }) => void exportAs(key as 'xlsx' | 'csv'),
                }}
              >
                <Button icon={<DownloadOutlined />} loading={exporting}>
                  Export
                </Button>
              </Dropdown>
            )}
            {canImport && (
              <Button icon={<UploadOutlined />} onClick={() => navigate('/employees/import')}>
                Import
              </Button>
            )}
            {canCreate && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/employees/new')}>
                Add employee
              </Button>
            )}
          </>
        }
      />
      {view === 'table' ? (
        <DataTable<EmployeeListItem>
          rowKey="id"
          columns={columns}
          data={employees.data?.items}
          meta={employees.data?.meta}
          loading={employees.isFetching}
          query={query}
          onQueryChange={updateQuery}
          searchPlaceholder="Search name, code, e-mail, CNIC, phone"
          onRowClick={(e) => navigate(`/employees/${e.id}`)}
          toolbar={filterBar}
        />
      ) : (
        <Card styles={{ body: { padding: 16 } }}>
          <Flex wrap gap={12} style={{ marginBottom: 16 }}>
            <Input.Search
              allowClear
              placeholder="Search name, code, e-mail, CNIC, phone"
              defaultValue={query.search}
              onSearch={(v) => updateQuery({ search: v || undefined, page: 1 })}
              style={{ maxWidth: 300 }}
            />
            {filterBar}
          </Flex>
          <Spin spinning={employees.isFetching}>
            {employees.data?.items.length ? (
              <Row gutter={[12, 12]}>
                {employees.data.items.map((e) => (
                  <Col key={e.id} xs={24} sm={12} md={8} lg={6} xxl={4}>
                    <EmployeeCard employee={e} />
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="No employees match" />
            )}
          </Spin>
          <Flex justify="flex-end" style={{ marginTop: 16 }}>
            <Pagination
              current={employees.data?.meta.page ?? 1}
              pageSize={24}
              total={employees.data?.meta.totalCount ?? 0}
              showSizeChanger={false}
              onChange={(page) => updateQuery({ page })}
            />
          </Flex>
        </Card>
      )}
    </>
  );
}
