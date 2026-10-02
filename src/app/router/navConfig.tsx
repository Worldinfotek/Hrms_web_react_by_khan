import {
  ApartmentOutlined,
  ApiOutlined,
  AuditOutlined,
  BankOutlined,
  BellOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ControlOutlined,
  DollarOutlined,
  FieldTimeOutlined,
  FileExclamationOutlined,
  FileProtectOutlined,
  FolderOpenOutlined,
  FormOutlined,
  HistoryOutlined,
  HomeOutlined,
  IdcardOutlined,
  RocketOutlined,
  SafetyOutlined,
  ScheduleOutlined,
  SolutionOutlined,
  TeamOutlined,
  BarChartOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons';
import { Tag } from 'antd';
import type { MenuProps } from 'antd';
import type { ReactNode } from 'react';
import { brandColors } from '@/theme/themeConfig';

/** Roles the sidebar understands. Demo tools sets one of these; later this can be the signed-in role. */
export const NAV_ROLES = [
  'super-admin',
  'hr-admin',
  'hr-executive',
  'employee',
  'manager',
  'finance',
  'management',
] as const;

export type NavRole = (typeof NAV_ROLES)[number];

export interface NavItem {
  key: string;
  label: string;
  /** Absolute route. Parents that only expand have no path. */
  path?: string;
  icon?: ReactNode;
  roles: NavRole[];
  /** Shown in the Settings menu. The screen is a placeholder. */
  comingNext?: boolean;
  children?: NavItem[];
}

export interface NavGroup {
  key: string;
  /** Small heading. Omitted for the Home row. */
  label?: string;
  /** One line on the Settings landing card. */
  description?: string;
  items: NavItem[];
}

/** Roles that use the web app. Employee and Manager stay in NavRole for a future login mapping, and are not in this sidebar. */
export const WEB_ROLES = ['super-admin', 'hr-admin', 'hr-executive', 'finance', 'management'] as const satisfies readonly NavRole[];

const HR: NavRole[] = ['super-admin', 'hr-admin', 'hr-executive'];
const HR_FINANCE: NavRole[] = [...HR, 'finance'];
const REPORTS: NavRole[] = [...HR_FINANCE, 'management'];
const WEB: NavRole[] = [...WEB_ROLES];
const SUPER: NavRole[] = ['super-admin'];

/** Main sidebar, in display order. No group headings. Settings is pinned separately. */
export const sidebarGroups: NavGroup[] = [
  {
    key: 'main',
    items: [
      { key: 'home', label: 'Home', path: '/', icon: <HomeOutlined />, roles: WEB },
      {
        key: 'employees',
        label: 'Employees',
        icon: <TeamOutlined />,
        roles: HR_FINANCE,
        children: [
          { key: 'directory', label: 'Employee directory', path: '/employees', icon: <IdcardOutlined />, roles: HR },
          {
            key: 'documents',
            label: 'Documents',
            icon: <FolderOpenOutlined />,
            roles: HR,
            children: [
              { key: 'documents-missing', label: 'Missing documents', path: '/documents/missing', icon: <FileExclamationOutlined />, roles: HR },
              { key: 'documents-expiring', label: 'Expiring documents', path: '/documents/expiring', icon: <CalendarOutlined />, roles: HR },
            ],
          },
          { key: 'probation', label: 'Probation', path: '/probation', icon: <ScheduleOutlined />, roles: HR },
          { key: 'offboarding', label: 'Offboarding', path: '/offboarding', icon: <UserDeleteOutlined />, roles: HR_FINANCE },
        ],
      },
      {
        key: 'recruitment',
        label: 'Recruitment',
        icon: <SolutionOutlined />,
        roles: HR,
        children: [
          { key: 'vacancies', label: 'Job vacancies', path: '/recruitment', icon: <SolutionOutlined />, roles: HR },
          { key: 'pipeline', label: 'Candidate pipeline', path: '/recruitment/pipeline', icon: <ApartmentOutlined />, roles: HR },
        ],
      },
      {
        key: 'onboarding',
        label: 'Onboarding',
        icon: <RocketOutlined />,
        roles: HR,
        children: [
          { key: 'joiners', label: 'Onboarding progress', path: '/onboarding', icon: <RocketOutlined />, roles: HR },
          { key: 'onboarding-tasks', label: 'Onboarding checklist', path: '/onboarding/tasks', icon: <FormOutlined />, roles: HR },
        ],
      },
      {
        key: 'attendance',
        label: 'Attendance',
        icon: <ClockCircleOutlined />,
        roles: HR,
        children: [
          { key: 'attendance-daily', label: 'Daily attendance', path: '/attendance', icon: <ClockCircleOutlined />, roles: HR },
          { key: 'attendance-month', label: 'Monthly attendance', path: '/attendance/month', icon: <CalendarOutlined />, roles: HR },
          { key: 'attendance-corrections', label: 'Correction requests', path: '/attendance/corrections', icon: <FormOutlined />, roles: HR },
          { key: 'attendance-import', label: 'Attendance import', path: '/attendance/import', icon: <FileProtectOutlined />, roles: HR },
        ],
      },
      {
        key: 'leave',
        label: 'Leave',
        icon: <CalendarOutlined />,
        roles: HR,
        children: [
          { key: 'leave-requests', label: 'Leave requests', path: '/leave', icon: <FormOutlined />, roles: HR },
          { key: 'leave-calendar', label: 'Team calendar', path: '/leave/calendar', icon: <CalendarOutlined />, roles: HR },
          { key: 'leave-balances', label: 'Leave balances', path: '/leave/balances', icon: <ScheduleOutlined />, roles: HR },
        ],
      },
      {
        key: 'payroll',
        label: 'Payroll',
        icon: <DollarOutlined />,
        roles: HR_FINANCE,
        children: [
          { key: 'salary-master', label: 'Salary master', path: '/payroll/salary-master', icon: <IdcardOutlined />, roles: HR_FINANCE },
          { key: 'salary-structures', label: 'Salary structures', path: '/payroll/structures', icon: <DollarOutlined />, roles: HR_FINANCE },
          { key: 'monthly-payroll', label: 'Monthly payroll', path: '/payroll', icon: <DollarOutlined />, roles: HR_FINANCE },
          { key: 'payslips', label: 'Payslips', path: '/payroll/payslips', icon: <FileProtectOutlined />, roles: HR_FINANCE },
          { key: 'payroll-history', label: 'Payroll history', path: '/payroll/history', icon: <CalendarOutlined />, roles: HR_FINANCE },
        ],
      },
      { key: 'reports', label: 'Reports', path: '/reports', icon: <BarChartOutlined />, roles: REPORTS },
    ],
  },
];

/** Settings page groups. Existing screens keep their routes. */
export const settingsGroups: NavGroup[] = [
  {
    key: 'organization',
    label: 'Organization',
    description: 'Company, branches, departments, designations, and teams.',
    items: [
      { key: 'company', label: 'Company and branches', path: '/settings/organization?tab=companies', icon: <BankOutlined />, roles: HR },
      { key: 'departments', label: 'Departments', path: '/settings/organization?tab=departments', icon: <ApartmentOutlined />, roles: HR },
      { key: 'designations', label: 'Designations', path: '/settings/organization?tab=designations', icon: <IdcardOutlined />, roles: HR },
      { key: 'teams', label: 'Teams', path: '/settings/organization?tab=teams', icon: <TeamOutlined />, roles: HR },
    ],
  },
  {
    key: 'access',
    label: 'Users and access',
    description: 'Who can sign in, what they can approve, and the audit log.',
    items: [
      { key: 'users', label: 'Users', path: '/users', icon: <TeamOutlined />, roles: SUPER },
      { key: 'roles', label: 'Roles and permissions', path: '/roles', icon: <SafetyOutlined />, roles: SUPER },
      {
        key: 'approval-authority',
        label: 'Approval authority',
        path: '/settings/approval-authority',
        icon: <SafetyOutlined />,
        roles: SUPER,
        comingNext: true,
      },
      {
        key: 'login-rules',
        label: 'Login and session controls',
        path: '/settings/login-rules',
        icon: <HistoryOutlined />,
        roles: SUPER,
        comingNext: true,
      },
      { key: 'audit-log', label: 'Audit log', path: '/audit-logs', icon: <AuditOutlined />, roles: SUPER },
    ],
  },
  {
    key: 'attendance-settings',
    label: 'Attendance',
    description: 'Shifts, holidays, and the attendance policy.',
    items: [
      { key: 'shifts', label: 'Shifts', path: '/settings/shifts', icon: <ClockCircleOutlined />, roles: HR },
      { key: 'holidays', label: 'Holidays', path: '/settings/holidays', icon: <CalendarOutlined />, roles: HR },
      { key: 'attendance-policy', label: 'Attendance policy', path: '/settings/attendance-policy', icon: <FieldTimeOutlined />, roles: HR },
    ],
  },
  {
    key: 'leave-settings',
    label: 'Leave',
    description: 'Leave types used by requests and balances.',
    items: [{ key: 'leave-types', label: 'Leave types', path: '/settings/leave-types', icon: <ScheduleOutlined />, roles: HR }],
  },
  {
    key: 'payroll-settings',
    label: 'Payroll',
    description: 'Salary structures used by monthly payroll.',
    items: [
      { key: 'salary-structures', label: 'Salary structures', path: '/payroll/structures', icon: <DollarOutlined />, roles: HR },
    ],
  },
  {
    key: 'document-settings',
    label: 'Documents',
    description: 'Document types kept on the employee file.',
    items: [{ key: 'document-types', label: 'Document types', path: '/settings/document-types', icon: <FileProtectOutlined />, roles: HR }],
  },
  {
    key: 'onboarding-settings',
    label: 'Onboarding',
    description: 'Checklist templates for new joiners.',
    items: [
      { key: 'onboarding-templates', label: 'Onboarding templates', path: '/settings/onboarding-templates', icon: <RocketOutlined />, roles: HR },
    ],
  },
  {
    key: 'notification-settings',
    label: 'Notifications',
    description: 'Alert templates and reminder schedules.',
    items: [
      { key: 'alert-templates', label: 'Alert templates', path: '/settings/alerts', icon: <BellOutlined />, roles: HR },
      { key: 'reminder-schedules', label: 'Reminder schedules', path: '/settings/alerts?view=reminders', icon: <BellOutlined />, roles: HR },
    ],
  },
  {
    key: 'integrations',
    label: 'Integrations',
    description: 'API clients, webhooks, and readiness.',
    items: [
      { key: 'api-clients', label: 'API clients', path: '/settings/api-clients', icon: <ApiOutlined />, roles: SUPER },
      { key: 'webhooks', label: 'Webhooks', path: '/integrations', icon: <ApiOutlined />, roles: SUPER },
      {
        key: 'integration-readiness',
        label: 'Integration readiness',
        path: '/settings/api-clients?view=readiness',
        icon: <ApiOutlined />,
        roles: SUPER,
      },
    ],
  },
  {
    key: 'data',
    label: 'Data',
    description: 'Employee import and export.',
    items: [
      { key: 'employee-import', label: 'Employee import and export', path: '/employees/import', icon: <FileProtectOutlined />, roles: SUPER },
    ],
  },
];

export const settingsNavItem: NavItem = {
  key: 'settings',
  label: 'Settings',
  path: '/settings',
  icon: <ControlOutlined />,
  roles: HR,
};

export function filterItems(items: NavItem[], role: NavRole): NavItem[] {
  return items
    .filter((item) => item.roles.includes(role))
    .map((item) => (item.children ? { ...item, children: filterItems(item.children, role) } : item))
    .filter((item) => !item.children || item.children.length > 0);
}

export function filterGroups(groups: NavGroup[], role: NavRole): NavGroup[] {
  return groups
    .map((group) => ({ ...group, items: filterItems(group.items, role) }))
    .filter((group) => group.items.length > 0);
}

export function canSeeSettings(role: NavRole): boolean {
  return settingsNavItem.roles.includes(role) && filterGroups(settingsGroups, role).length > 0;
}

export function pathMatches(path: string, pathname: string, search: string): boolean {
  const [base, query] = path.split('?');
  if (query) {
    if (pathname !== base) return false;
    const want = new URLSearchParams(query);
    const have = new URLSearchParams(search);
    for (const [key, value] of want) {
      if (have.get(key) !== value) return false;
    }
    return true;
  }
  if (base === '/') return pathname === '/';
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function collectPaths(groups: NavGroup[]): string[] {
  const paths: string[] = [];
  const walk = (items: NavItem[]) => {
    for (const item of items) {
      if (item.path) paths.push(item.path);
      if (item.children) walk(item.children);
    }
  };
  groups.forEach((group) => walk(group.items));
  return paths;
}

/** The settings group and item that own this route, when the route is in the settings menu. */
export function findSettingsMatch(
  groups: NavGroup[],
  pathname: string,
  search: string,
): { group: NavGroup; item: NavItem } | undefined {
  const hit = bestPath(collectPaths(groups), pathname, search);
  if (!hit) return undefined;
  for (const group of groups) {
    const item = group.items.find((entry) => entry.path === hit);
    if (item) return { group, item };
  }
  return undefined;
}

/** Longest matching path wins, so /payroll/summary does not highlight /payroll. */
export function bestPath(paths: string[], pathname: string, search: string): string | undefined {
  return paths
    .filter((path) => pathMatches(path, pathname, search))
    .sort((a, b) => b.length - a.length)[0];
}

/** Keys of every collapsible parent that contains the current route, outer first. */
export function findOpenKeys(groups: NavGroup[], pathname: string, search: string): string[] {
  const walk = (items: NavItem[]): string[] | undefined => {
    for (const item of items) {
      if (!item.children?.length) continue;
      const childPaths = collectPaths([{ key: item.key, items: item.children }]);
      if (!bestPath(childPaths, pathname, search)) continue;
      return [item.key, ...(walk(item.children) ?? [])];
    }
    return undefined;
  };
  for (const group of groups) {
    const found = walk(group.items);
    if (found) return found;
  }
  return [];
}

function itemLabel(item: NavItem): ReactNode {
  if (!item.comingNext) return item.label;
  return (
    <span>
      {item.label}{' '}
      <Tag color="blue" style={{ marginInlineEnd: 0 }}>
        Coming next
      </Tag>
    </span>
  );
}

function toItem(item: NavItem): NonNullable<MenuProps['items']>[number] {
  return {
    key: item.path ?? item.key,
    icon: item.icon,
    label: itemLabel(item),
    children: item.children?.map(toItem),
  };
}

export function groupsToMenuItems(groups: NavGroup[]): MenuProps['items'] {
  const items: NonNullable<MenuProps['items']> = [];
  for (const group of groups) {
    const children = group.items.map(toItem);
    if (!group.label) {
      items.push(...children);
      continue;
    }
    items.push({
      type: 'group',
      key: group.key,
      label: (
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', color: brandColors.textSecondary }}>
          {group.label}
        </span>
      ),
      children,
    });
  }
  return items;
}
