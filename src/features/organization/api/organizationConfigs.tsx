import { HomeOutlined } from '@ant-design/icons';
import { Flex, Tag, Typography } from 'antd';
import { Permissions } from '@/shared/auth/permissions';
import type { MasterConfig, MasterField } from '@/shared/master-data';
import type { Branch, Company, Department, Designation, Team } from '../types';

const code = {
  name: 'code',
  label: 'Code',
  required: true,
  max: 30,
  half: true,
  placeholder: 'e.g. HR',
} as const;
const name = { name: 'name', label: 'Name', required: true, max: 150, half: true } as const;
const description = { name: 'description', label: 'Description', type: 'textarea', max: 500 } as const;
const phoneRule = { pattern: /^\+?[0-9\s()-]{7,30}$/, message: 'Phone number is not valid.' };

function locationFields<T>(): MasterField<T>[] {
  return [
    { name: 'countryId', label: 'Country', type: 'lookup', lookupKey: 'country', half: true },
    { name: 'cityId', label: 'City', type: 'lookup', lookupKey: 'city', dependsOn: 'countryId', half: true },
  ];
}

export const companyConfig: MasterConfig<Company> = {
  queryKey: 'companies',
  urls: { list: '/companies', create: '/companies', item: '/companies' },
  label: 'Company',
  permissions: Permissions.Organization,
  drawerWidth: 640,
  columns: [
    {
      title: 'Location',
      key: 'city',
      render: (_, c) => [c.cityName, c.countryName].filter(Boolean).join(', ') || '—',
    },
    { title: 'Branches', dataIndex: 'branchCount', key: 'branchCount', align: 'right' },
    { title: 'Departments', dataIndex: 'departmentCount', key: 'departmentCount', align: 'right' },
  ],
  fields: [
    { ...code, placeholder: 'e.g. WIT' },
    name,
    { name: 'legalName', label: 'Legal name', max: 200 },
    { name: 'registrationNumber', label: 'Registration no. (SECP)', max: 50, half: true },
    { name: 'taxNumber', label: 'Tax number (NTN)', max: 50, half: true },
    {
      name: 'email',
      label: 'E-mail',
      max: 256,
      half: true,
      rules: [{ type: 'email', message: 'E-mail is not valid.' }],
    },
    { name: 'phone', label: 'Phone', max: 30, half: true, rules: [phoneRule] },
    {
      name: 'website',
      label: 'Website',
      max: 256,
      placeholder: 'https://',
      rules: [{ type: 'url', message: 'Website must be a valid URL.' }],
    },
    ...locationFields<Company>(),
    { name: 'address', label: 'Address', type: 'textarea', max: 500 },
    description,
  ],
};

export const branchConfig: MasterConfig<Branch> = {
  queryKey: 'branches',
  urls: { list: '/branches', create: '/branches', item: '/branches' },
  label: 'Branch',
  permissions: Permissions.Organization,
  drawerWidth: 600,
  renderName: (b) => (
    <Flex vertical>
      <Flex gap={6} align="center">
        <Typography.Text strong>{b.name}</Typography.Text>
        {b.isHeadOffice && (
          <Tag icon={<HomeOutlined />} color="blue">
            Head office
          </Tag>
        )}
      </Flex>
      {b.address && (
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {b.address}
        </Typography.Text>
      )}
    </Flex>
  ),
  columns: [
    { title: 'Company', dataIndex: 'companyName', key: 'companyName' },
    {
      title: 'City',
      key: 'city',
      render: (_, b) => [b.cityName, b.countryName].filter(Boolean).join(', ') || '—',
    },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', responsive: ['lg'], render: (v) => v ?? '—' },
  ],
  filters: [{ name: 'companyId', placeholder: 'All companies', lookupKey: 'companies' }],
  fields: [
    {
      name: 'companyId',
      label: 'Company',
      type: 'lookup',
      lookupKey: 'companies',
      required: true,
      createOnly: true,
    },
    code,
    name,
    {
      name: 'isHeadOffice',
      label: 'Head office',
      type: 'switch',
      tooltip: 'Only one head office per company – marking this one clears the others.',
    },
    ...locationFields<Branch>(),
    { name: 'phone', label: 'Phone', max: 30, half: true, rules: [phoneRule] },
    {
      name: 'email',
      label: 'E-mail',
      max: 256,
      half: true,
      rules: [{ type: 'email', message: 'E-mail is not valid.' }],
    },
    { name: 'address', label: 'Address', type: 'textarea', max: 500 },
    description,
  ],
};

export const departmentConfig: MasterConfig<Department> = {
  queryKey: 'departments',
  urls: { list: '/departments', create: '/departments', item: '/departments' },
  label: 'Department',
  permissions: Permissions.Organization,
  columns: [
    { title: 'Parent', dataIndex: 'parentName', key: 'parentName', render: (v) => v ?? <Tag>Top level</Tag> },
    { title: 'Company', dataIndex: 'companyName', key: 'companyName', responsive: ['lg'] },
    { title: 'Sub-depts', dataIndex: 'childCount', key: 'childCount', align: 'right' },
    { title: 'Teams', dataIndex: 'teamCount', key: 'teamCount', align: 'right' },
  ],
  filters: [
    { name: 'companyId', placeholder: 'All companies', lookupKey: 'companies' },
    { name: 'parentId', placeholder: 'Any parent', lookupKey: 'departments' },
  ],
  fields: [
    {
      name: 'companyId',
      label: 'Company',
      type: 'lookup',
      lookupKey: 'companies',
      required: true,
      createOnly: true,
    },
    {
      name: 'parentId',
      label: 'Parent department',
      type: 'lookup',
      lookupKey: 'departments',
      placeholder: 'None (top level)',
      tooltip: 'Leave empty for a top-level department.',
    },
    code,
    name,
    description,
  ],
};

export const teamConfig: MasterConfig<Team> = {
  queryKey: 'teams',
  urls: { list: '/teams', create: '/teams', item: '/teams' },
  label: 'Team',
  permissions: Permissions.Organization,
  columns: [{ title: 'Department', dataIndex: 'departmentName', key: 'departmentName' }],
  filters: [{ name: 'departmentId', placeholder: 'All departments', lookupKey: 'departments', width: 220 }],
  fields: [
    { name: 'departmentId', label: 'Department', type: 'lookup', lookupKey: 'departments', required: true },
    code,
    name,
    description,
  ],
};

export const designationConfig: MasterConfig<Designation> = {
  queryKey: 'designations',
  urls: { list: '/designations', create: '/designations', item: '/designations' },
  label: 'Designation',
  permissions: Permissions.Organization,
  columns: [
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      sorter: true,
      render: (v) => (v ? <Tag>{v}</Tag> : '—'),
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      sorter: true,
      align: 'right',
      render: (v) => v ?? '—',
    },
  ],
  fields: [
    { ...code, placeholder: 'e.g. SSE' },
    name,
    { name: 'grade', label: 'Grade', max: 20, half: true, placeholder: 'e.g. G5' },
    {
      name: 'level',
      label: 'Level',
      type: 'number',
      min: 1,
      maxValue: 100,
      half: true,
      tooltip: 'Seniority for ordering and reports (1 = junior).',
    },
    description,
  ],
};
