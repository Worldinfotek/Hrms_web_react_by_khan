import {
  ApartmentOutlined,
  BankOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  TeamOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Segmented, Tabs } from 'antd';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components';
import { MasterDataSection } from '@/shared/master-data';
import {
  branchConfig,
  companyConfig,
  departmentConfig,
  designationConfig,
  teamConfig,
} from '../api/organizationConfigs';
import { DepartmentTreeView } from '../components/DepartmentTreeView';
import type { Branch, Company, Department, Designation, Team } from '../types';

const TABS = ['companies', 'branches', 'departments', 'teams', 'designations'] as const;
type TabKey = (typeof TABS)[number];

/** Settings → Organization: one tab per organization master. The open tab is kept in the URL (?tab=). */
export default function OrganizationSetupPage() {
  const [params, setParams] = useSearchParams();
  const tab: TabKey = TABS.includes(params.get('tab') as TabKey)
    ? (params.get('tab') as TabKey)
    : 'departments';
  const [departmentView, setDepartmentView] = useState<'tree' | 'list'>('tree');

  const viewSwitch = (
    <Segmented
      value={departmentView}
      onChange={(v) => setDepartmentView(v as 'tree' | 'list')}
      options={[
        { value: 'tree', icon: <ApartmentOutlined />, label: 'Tree' },
        { value: 'list', icon: <UnorderedListOutlined />, label: 'List' },
      ]}
    />
  );

  return (
    <>
      <PageHeader
        title="Organization Setup"
        subtitle="Company structure used by every module – departments, locations, teams and job titles"
      />
      <Tabs
        activeKey={tab}
        onChange={(key) => setParams({ tab: key }, { replace: true })}
        destroyOnHidden
        items={[
          {
            key: 'companies',
            icon: <BankOutlined />,
            label: 'Company',
            children: <MasterDataSection<Company> config={companyConfig} />,
          },
          {
            key: 'branches',
            icon: <EnvironmentOutlined />,
            label: 'Branches / Locations',
            children: <MasterDataSection<Branch> config={branchConfig} />,
          },
          {
            key: 'departments',
            icon: <ApartmentOutlined />,
            label: 'Departments',
            children: (
              <>
                <div style={{ marginBottom: 12 }}>{viewSwitch}</div>
                {departmentView === 'tree' ? (
                  <DepartmentTreeView />
                ) : (
                  <MasterDataSection<Department> config={departmentConfig} />
                )}
              </>
            ),
          },
          {
            key: 'teams',
            icon: <TeamOutlined />,
            label: 'Teams',
            children: <MasterDataSection<Team> config={teamConfig} />,
          },
          {
            key: 'designations',
            icon: <IdcardOutlined />,
            label: 'Designations',
            children: <MasterDataSection<Designation> config={designationConfig} />,
          },
        ]}
      />
    </>
  );
}
