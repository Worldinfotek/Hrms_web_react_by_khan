import { ExperimentOutlined } from '@ant-design/icons';
import { App, Button, Dropdown, Flex, Radio, Switch, Typography } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WEB_ROLES, type NavRole } from '@/app/router/navConfig';
import { useEssStore } from '@/features/ess/store';
import { useManagerStore } from '@/features/mss/store';
import { brandColors } from '@/theme/themeConfig';
import { useDemoRoleStore } from './demoRoleStore';
import { restoreAllSamples } from './restoreAllSamples';

const ROLE_LABEL: Record<NavRole, string> = {
  'super-admin': 'Super Admin',
  'hr-admin': 'HR Admin',
  'hr-executive': 'HR Executive',
  employee: 'Employee',
  manager: 'Manager',
  finance: 'Finance',
  management: 'Management',
};

const ESS_LINKS = [
  { label: 'My home', path: '/ess' },
  { label: 'My profile', path: '/ess/profile' },
  { label: 'My attendance', path: '/ess/attendance' },
  { label: 'My leave', path: '/ess/leave' },
  { label: 'My payslips', path: '/ess/payslips' },
  { label: 'My documents', path: '/ess/documents' },
  { label: 'HR requests', path: '/ess/requests' },
  { label: 'Announcements', path: '/ess/announcements' },
  { label: 'Resign', path: '/ess/resign' },
];

const MSS_LINKS = [
  { label: 'Manager home', path: '/manager' },
  { label: 'Directory', path: '/manager/team' },
  { label: 'Team attendance', path: '/manager/attendance' },
  { label: 'Team leave', path: '/manager/leave' },
  { label: 'Approvals', path: '/manager/inbox' },
];

/** Header menu for the walkthrough. Hidden when VITE_DEMO_MODE is "false". */
export function DemoTools() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const role = useDemoRoleStore((state) => state.role);
  const setRole = useDemoRoleStore((state) => state.setRole);
  const viewAsEmployee = useEssStore((state) => state.viewAsEmployee);
  const setViewAsEmployee = useEssStore((state) => state.setViewAsEmployee);
  const viewAsManager = useManagerStore((state) => state.viewAsManager);
  const setViewAsManager = useManagerStore((state) => state.setViewAsManager);

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      trigger={['click']}
      placement="bottomRight"
      popupRender={() => (
        <div
          style={{
            width: 280,
            maxHeight: '70vh',
            overflow: 'auto',
            padding: 12,
            background: '#fff',
            border: `1px solid ${brandColors.border}`,
            borderRadius: 8,
          }}
        >
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            View the sidebar as
          </Typography.Text>
          <Radio.Group
            value={role}
            onChange={(event) => setRole(event.target.value as NavRole)}
            style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '8px 0 12px' }}
          >
            {WEB_ROLES.map((value) => (
              <Radio key={value} value={value}>
                {ROLE_LABEL[value]}
              </Radio>
            ))}
          </Radio.Group>
          <Flex vertical gap={8}>
            <Flex justify="space-between" align="center">
              <span>View as employee</span>
              <Switch checked={viewAsEmployee} onChange={setViewAsEmployee} />
            </Flex>
            <Flex justify="space-between" align="center">
              <span>View as manager</span>
              <Switch checked={viewAsManager} onChange={setViewAsManager} />
            </Flex>
            <Button
              onClick={() => {
                restoreAllSamples();
                message.success('Sample data restored');
              }}
            >
              Restore samples
            </Button>
            <Button
              type="link"
              style={{ padding: 0, justifyContent: 'flex-start' }}
              onClick={() => {
                setOpen(false);
                navigate('/tour');
              }}
            >
              Product tour
            </Button>
            <Typography.Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
              Employee self-service
            </Typography.Text>
            {ESS_LINKS.map((item) => (
              <Button
                key={item.path}
                type="link"
                style={{ padding: 0, justifyContent: 'flex-start', height: 'auto' }}
                onClick={() => {
                  setOpen(false);
                  navigate(item.path);
                }}
              >
                {item.label}
              </Button>
            ))}
            <Typography.Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
              Manager self-service
            </Typography.Text>
            {MSS_LINKS.map((item) => (
              <Button
                key={item.path}
                type="link"
                style={{ padding: 0, justifyContent: 'flex-start', height: 'auto' }}
                onClick={() => {
                  setOpen(false);
                  navigate(item.path);
                }}
              >
                {item.label}
              </Button>
            ))}
          </Flex>
        </div>
      )}
    >
      <Button type="text" icon={<ExperimentOutlined />} aria-label="Demo tools">
        Demo tools
      </Button>
    </Dropdown>
  );
}
