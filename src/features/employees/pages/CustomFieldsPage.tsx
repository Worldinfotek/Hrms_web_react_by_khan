import { Tag } from 'antd';
import { PageHeader } from '@/shared/components';
import { Permissions } from '@/shared/auth/permissions';
import { MasterDataSection } from '@/shared/master-data';
import type { MasterConfig } from '@/shared/master-data';
import type { CustomFieldDefinition } from '../types';

const customFieldConfig: MasterConfig<CustomFieldDefinition & { isSystem?: boolean }> = {
  queryKey: 'custom-fields',
  urls: { list: '/custom-fields', create: '/custom-fields', item: '/custom-fields' },
  label: 'Custom field',
  permissions: {
    ...Permissions.MasterData,
    View: Permissions.Employees.Configure,
    Create: Permissions.Employees.Configure,
    Edit: Permissions.Employees.Configure,
    Delete: Permissions.Employees.Configure,
  },
  defaultSort: { sortBy: 'sortOrder', sortOrder: 'asc' },
  columns: [
    { title: 'Type', dataIndex: 'fieldType', key: 'fieldType', render: (t: string) => <Tag>{t}</Tag> },
    {
      title: 'Required',
      dataIndex: 'isRequired',
      key: 'isRequired',
      render: (v: boolean) => (v ? <Tag color="orange">Required</Tag> : 'Optional'),
    },
    {
      title: 'Options',
      dataIndex: 'options',
      key: 'options',
      render: (o: string[]) => (o.length ? o.join(', ') : '—'),
      responsive: ['lg'],
    },
    {
      title: 'Used by',
      dataIndex: 'valueCount',
      key: 'valueCount',
      align: 'right',
      render: (n: number) => `${n} employee(s)`,
    },
    { title: 'Order', dataIndex: 'sortOrder', key: 'sortOrder', align: 'right', sorter: true },
  ],
  fields: [
    { name: 'code', label: 'Code', required: true, max: 30, half: true, placeholder: 'e.g. SHIRT_SIZE' },
    { name: 'name', label: 'Label', required: true, max: 150, half: true, placeholder: 'e.g. Shirt size' },
    {
      name: 'fieldType',
      label: 'Type',
      type: 'select',
      required: true,
      half: true,
      createOnly: true,
      defaultValue: 'Text',
      tooltip: 'Cannot be changed later.',
      options: ['Text', 'Number', 'Date', 'Boolean', 'Select'].map((t) => ({
        value: t,
        label: t === 'Select' ? 'Dropdown (Select)' : t === 'Boolean' ? 'Yes / No' : t,
      })),
    },
    {
      name: 'sortOrder',
      label: 'Display order',
      type: 'number',
      min: 0,
      maxValue: 1000,
      half: true,
      required: true,
      defaultValue: 10,
    },
    {
      name: 'options',
      label: 'Dropdown options',
      type: 'tags',
      placeholder: 'Type an option and press Enter',
      visible: (v) => v.fieldType === 'Select',
      required: true,
    },
    {
      name: 'isRequired',
      label: 'Required',
      type: 'switch',
      tooltip: 'Employees cannot be saved without a value.',
    },
    { name: 'description', label: 'Help text', type: 'textarea', max: 500 },
  ],
};

/** Configurable HR fields captured on every employee profile. */
export default function CustomFieldsPage() {
  return (
    <>
      <PageHeader
        title="Custom HR Fields"
        subtitle="Extra employee fields defined by HR – shown as an extra step of the employee form"
      />
      <MasterDataSection config={customFieldConfig} />
    </>
  );
}
