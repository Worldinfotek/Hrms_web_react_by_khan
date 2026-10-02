import { Tag } from 'antd';
import { Permissions } from '@/shared/auth/permissions';
import type { MasterConfig } from '@/shared/master-data';
import type { EmployeeStatus, EmploymentType, LookupType, LookupValue } from '../types';

const code = {
  name: 'code',
  label: 'Code',
  required: true,
  max: 30,
  half: true,
  lockedForSystem: true,
} as const;
const name = { name: 'name', label: 'Name', required: true, max: 150, half: true } as const;
const description = { name: 'description', label: 'Description', type: 'textarea', max: 500 } as const;

export const employmentTypeConfig: MasterConfig<EmploymentType> = {
  queryKey: 'employment-types',
  urls: { list: '/employment-types', create: '/employment-types', item: '/employment-types' },
  label: 'Employment type',
  permissions: Permissions.MasterData,
  columns: [
    {
      title: 'Default probation',
      dataIndex: 'defaultProbationMonths',
      key: 'defaultProbationMonths',
      sorter: true,
      align: 'right',
      render: (v: number | null) => (v ? `${v} month${v > 1 ? 's' : ''}` : '—'),
    },
  ],
  fields: [
    { ...code, placeholder: 'e.g. PERMANENT' },
    name,
    {
      name: 'defaultProbationMonths',
      label: 'Default probation (months)',
      type: 'number',
      min: 0,
      maxValue: 24,
      tooltip: 'Pre-filled when an employee of this type is created (used in Phase 10).',
    },
    description,
  ],
};

export const employeeStatusConfig: MasterConfig<EmployeeStatus> = {
  queryKey: 'employee-statuses',
  urls: { list: '/employee-statuses', create: '/employee-statuses', item: '/employee-statuses' },
  label: 'Employee status',
  permissions: Permissions.MasterData,
  defaultSort: { sortBy: 'sortOrder', sortOrder: 'asc' },
  systemCannotDeactivate: true,
  columns: [
    {
      title: 'Tag',
      key: 'color',
      render: (_, s) => <Tag color={s.color}>{s.name}</Tag>,
    },
    {
      title: 'Employed?',
      dataIndex: 'isActiveEmployment',
      key: 'isActiveEmployment',
      sorter: true,
      render: (v: boolean) => (v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>),
    },
    { title: 'Order', dataIndex: 'sortOrder', key: 'sortOrder', sorter: true, align: 'right' },
  ],
  fields: [
    { ...code, placeholder: 'e.g. ON_LEAVE' },
    name,
    { name: 'color', label: 'Tag colour', type: 'color', half: true, defaultValue: 'default' },
    {
      name: 'sortOrder',
      label: 'Display order',
      type: 'number',
      min: 0,
      maxValue: 1000,
      half: true,
      required: true,
      defaultValue: 100,
    },
    {
      name: 'isActiveEmployment',
      label: 'Still employed',
      type: 'switch',
      lockedForSystem: true,
      defaultValue: true,
      tooltip: 'On = the person counts in headcount and may sign in. Off = separated (resigned, exited…).',
    },
    description,
  ],
};

export const lookupTypeConfig: MasterConfig<LookupType> = {
  queryKey: 'lookup-types',
  urls: { list: '/lookup-types', create: '/lookup-types', item: '/lookup-types' },
  label: 'Lookup list',
  permissions: Permissions.MasterData,
  systemCannotDeactivate: true,
  fields: [
    { ...code, placeholder: 'e.g. RELIGION' },
    name,
    {
      name: 'parentTypeId',
      label: 'Parent list',
      type: 'select',
      createOnly: true,
      tooltip: 'Values of this list belong to a value of the parent list (e.g. City → Country).',
    },
    description,
  ],
};

/** Values config is built per selected lookup type (URLs depend on the type id). */
export function lookupValueConfig(type: LookupType, parentKey?: string): MasterConfig<LookupValue> {
  return {
    queryKey: 'lookup-values',
    urls: {
      list: `/lookup-types/${type.id}/values`,
      create: `/lookup-types/${type.id}/values`,
      item: '/lookup-values',
    },
    label: 'Value',
    permissions: Permissions.MasterData,
    defaultSort: { sortBy: 'sortOrder', sortOrder: 'asc' },
    searchPlaceholder: `Search ${type.name.toLowerCase()}`,
    columns: [
      ...(type.parentTypeId
        ? [
            {
              title: type.parentTypeName ?? 'Parent',
              dataIndex: 'parentName',
              key: 'parentName',
              render: (v: string | null) => v ?? '—',
            },
          ]
        : []),
      {
        title: 'Order',
        dataIndex: 'sortOrder',
        key: 'sortOrder',
        sorter: true,
        align: 'right' as const,
        width: 90,
      },
    ],
    filters: parentKey
      ? [
          {
            name: 'parentId',
            placeholder: `Filter by ${type.parentTypeName?.toLowerCase() ?? 'parent'}`,
            lookupKey: parentKey,
          },
        ]
      : [],
    fields: [
      { name: 'code', label: 'Code', required: true, max: 30, half: true },
      name,
      ...(parentKey
        ? [
            {
              name: 'parentId',
              label: type.parentTypeName ?? 'Parent',
              type: 'lookup' as const,
              lookupKey: parentKey,
              required: true,
            },
          ]
        : []),
      {
        name: 'sortOrder',
        label: 'Display order',
        type: 'number',
        min: 0,
        maxValue: 10000,
        required: true,
        defaultValue: 100,
        half: true,
      },
      description,
    ],
  };
}
