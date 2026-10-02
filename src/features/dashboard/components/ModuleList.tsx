import { CloseOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Flex, Input } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { filterGroups, settingsGroups, sidebarGroups, type NavGroup, type NavItem } from '@/app/router/navConfig';
import { useNavRole } from '@/app/router/useNavRole';
import styles from '../dashboard.module.css';

interface Leaf {
  label: string;
  path: string;
}

interface Group {
  key: string;
  label: string;
  items: Leaf[];
}

const SINGLE_LABEL: Record<string, string> = {
  dashboard: 'HR dashboard',
  employees: 'Employee list',
  probation: 'Probation cases',
  notifications: 'Notification history',
  offboarding: 'Exit tracker',
  reports: 'Reports centre',
  integrations: 'Integration monitor',
  tour: 'Click path',
};

const INQUIRIES: Group[] = [
  {
    key: 'inq-workers',
    label: 'Workers',
    items: [
      { label: 'Headcount', path: '/' },
      { label: 'Employee master', path: '/employees' },
      { label: 'Joining report', path: '/onboarding' },
      { label: 'Exit report', path: '/reports?report=offboarding' },
      { label: 'Department headcount', path: '/reports?report=employee' },
    ],
  },
  {
    key: 'inq-recruitment',
    label: 'Recruitment',
    items: [
      { label: 'Vacancy statistics', path: '/recruitment' },
      { label: 'Candidate pipeline', path: '/reports?report=recruitment' },
      { label: 'Interview status', path: '/recruitment/pipeline' },
    ],
  },
  {
    key: 'inq-attendance',
    label: 'Attendance',
    items: [
      { label: 'Daily status', path: '/reports?report=attendance' },
      { label: 'Today’s board', path: '/attendance' },
    ],
  },
  {
    key: 'inq-leave',
    label: 'Leave',
    items: [{ label: 'Leave requests', path: '/reports?report=leave' }],
  },
  {
    key: 'inq-payroll',
    label: 'Payroll',
    items: [{ label: 'Current run', path: '/reports?report=payroll' }],
  },
  {
    key: 'inq-probation',
    label: 'Probation',
    items: [{ label: 'Probation cases', path: '/reports?report=probation' }],
  },
  {
    key: 'inq-documents',
    label: 'Documents',
    items: [{ label: 'Documents on file', path: '/reports?report=documents' }],
  },
];

function leaves(item: NavItem): Leaf[] {
  if (item.children?.length) {
    return item.children.flatMap((child) => (child.path ? [{ label: child.label, path: child.path }] : leaves(child)));
  }
  return item.path ? [{ label: item.label, path: item.path }] : [];
}

function moduleGroups(groups: NavGroup[]): Group[] {
  return groups
    .map((group) => ({
      key: group.key,
      label: group.label ?? group.items[0]?.label ?? 'Home',
      items: group.items.flatMap((item) => {
        const rows = leaves(item);
        return rows.map((row) => ({
          ...row,
          label: row.label === item.label ? (SINGLE_LABEL[item.key] ?? row.label) : row.label,
        }));
      }),
    }))
    .filter((group) => group.items.length > 0);
}

function Column({
  title,
  groups,
  query,
  onOpen,
}: {
  title: string;
  groups: Group[];
  query: string;
  onOpen: (path: string) => void;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return groups;
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) => item.label.toLowerCase().includes(needle) || group.label.toLowerCase().includes(needle),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, query]);

  const isOpen = (key: string) => open[key] ?? true;

  return (
    <section>
      <h2 className={styles.columnTitle}>{title}</h2>
      {visible.length === 0 ? <div className={styles.empty}>No modules match.</div> : null}
      {visible.map((group) => (
        <div key={group.key} className={styles.group}>
          <button type="button" className={styles.groupBtn} aria-expanded={isOpen(group.key)} onClick={() => setOpen((state) => ({ ...state, [group.key]: !isOpen(group.key) }))}>
            <RightOutlined className={`${styles.chevron} ${isOpen(group.key) ? styles.chevronOpen : ''}`} />
            {group.label}
          </button>
          <div className={`${styles.groupBody} ${isOpen(group.key) ? styles.groupBodyOpen : ''}`}>
            <div className={styles.groupInner}>
              {group.items.map((item) => (
                <a
                  key={`${group.key}-${item.label}`}
                  className={styles.link}
                  href={item.path}
                  onClick={(event) => {
                    event.preventDefault();
                    onOpen(item.path);
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

export function ModuleList({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const role = useNavRole();
  const [query, setQuery] = useState('');
  const common = useMemo(() => {
    const menu = filterGroups(sidebarGroups, role);
    const settings = filterGroups(settingsGroups, role);
    return [
      ...moduleGroups(menu),
      ...(settings.length
        ? [
            {
              key: 'settings',
              label: 'Settings',
              items: settings.flatMap((group) =>
                group.items
                  .filter((item) => item.path)
                  .map((item) => ({ label: `${group.label}: ${item.label}`, path: item.path as string })),
              ),
            },
          ]
        : []),
    ];
  }, [role]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-label="Module list">
      <div className={styles.overlayHead}>
        <Flex align="center" gap={10} className={styles.brand}>
          <img src="/favicon.svg" alt="" width={36} height={36} />
          <div>
            WIT HRMS
            <small>Human Resource Management System</small>
          </div>
        </Flex>
        <Button icon={<CloseOutlined />} onClick={onClose}>
          Close
        </Button>
      </div>
      <div className={styles.searchWrap}>
        <Input
          className={styles.search}
          allowClear
          placeholder="Search modules"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search modules"
        />
      </div>
      <div className={styles.columns}>
        <Column
          title="Common"
          groups={common}
          query={query}
          onOpen={(path) => {
            onClose();
            navigate(path);
          }}
        />
        <Column
          title="Inquiries"
          groups={INQUIRIES}
          query={query}
          onOpen={(path) => {
            onClose();
            navigate(path);
          }}
        />
      </div>
    </div>
  );
}
