import { IdcardOutlined, TagsOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Tabs } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components';
import { MasterDataSection } from '@/shared/master-data';
import { employeeStatusConfig, employmentTypeConfig } from '../api/masterDataConfigs';
import { LookupListsView } from '../components/LookupListsView';
import type { EmployeeStatus, EmploymentType } from '../types';

const TABS = ['employment-types', 'employee-statuses', 'lookups'] as const;
type TabKey = (typeof TABS)[number];

/** Settings → Master Data: configurable lists so nothing is hard-coded. */
export default function MasterDataPage() {
  const [params, setParams] = useSearchParams();
  const tab: TabKey = TABS.includes(params.get('tab') as TabKey)
    ? (params.get('tab') as TabKey)
    : 'employment-types';

  return (
    <>
      <PageHeader
        title="Master Data"
        subtitle="Employment types, employee statuses and dropdown lists used across the system"
      />
      <Tabs
        activeKey={tab}
        onChange={(key) => setParams({ tab: key }, { replace: true })}
        destroyOnHidden
        items={[
          {
            key: 'employment-types',
            icon: <IdcardOutlined />,
            label: 'Employment Types',
            children: <MasterDataSection<EmploymentType> config={employmentTypeConfig} />,
          },
          {
            key: 'employee-statuses',
            icon: <TagsOutlined />,
            label: 'Employee Statuses',
            children: <MasterDataSection<EmployeeStatus> config={employeeStatusConfig} />,
          },
          {
            key: 'lookups',
            icon: <UnorderedListOutlined />,
            label: 'Lookup Lists',
            children: <LookupListsView />,
          },
        ]}
      />
    </>
  );
}
