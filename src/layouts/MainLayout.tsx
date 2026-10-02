import {
  DownOutlined,
  KeyOutlined,
  LeftOutlined,
  LogoutOutlined,
  MenuOutlined,
  RightOutlined,
  UserOutlined,
  DisconnectOutlined,
} from '@ant-design/icons';
import {
  App,
  Avatar,
  Breadcrumb,
  Button,
  Drawer,
  Dropdown,
  Flex,
  Grid,
  Layout,
  Menu,
  Typography,
} from 'antd';
import type { MenuProps } from 'antd';
import { useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useMatches, useNavigate } from 'react-router-dom';
import {
  bestPath,
  canSeeSettings,
  collectPaths,
  filterGroups,
  findOpenKeys,
  findSettingsMatch,
  groupsToMenuItems,
  settingsGroups,
  settingsNavItem,
  sidebarGroups,
} from '@/app/router/navConfig';
import { isDemoMode, useNavRole } from '@/app/router/useNavRole';
import { useLogout, useLogoutAll } from '@/features/auth/api/authApi';
import { DemoTools } from '@/features/demo/DemoTools';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { useAuthStore } from '@/stores/authStore';
import { brandColors } from '@/theme/themeConfig';

const { Header, Sider, Content } = Layout;

type RouteHandle = { title?: string } | undefined;

/** Application shell: role-aware sidebar, header with user menu, breadcrumb and page content. */
export function MainLayout() {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const matches = useMatches();
  const { modal } = App.useApp();
  const user = useAuthStore((state) => state.user);
  const role = useNavRole();
  const logout = useLogout();
  const logoutAll = useLogoutAll();

  const visibleMenu = useMemo(() => filterGroups(sidebarGroups, role), [role]);
  const menuItems = useMemo(() => groupsToMenuItems(visibleMenu), [visibleMenu]);
  const showSettings = canSeeSettings(role);
  const settingsVisible = useMemo(() => filterGroups(settingsGroups, role), [role]);
  const settingsMatch = useMemo(
    () => (showSettings ? findSettingsMatch(settingsVisible, location.pathname, location.search) : undefined),
    [showSettings, settingsVisible, location.pathname, location.search],
  );
  const selectedKey = useMemo(() => {
    const settingsHit = bestPath(collectPaths(settingsVisible), location.pathname, location.search);
    const sidebarHit = bestPath(collectPaths(visibleMenu), location.pathname, location.search);
    const settingsWins =
      showSettings &&
      (Boolean(settingsHit) || location.pathname.startsWith('/settings')) &&
      (!sidebarHit || (settingsHit !== undefined && settingsHit.length > sidebarHit.length));
    if (settingsWins) return '/settings';
    return sidebarHit ?? location.pathname;
  }, [visibleMenu, settingsVisible, showSettings, location.pathname, location.search]);
  const activeOpen = useMemo(
    () => findOpenKeys(visibleMenu, location.pathname, location.search),
    [visibleMenu, location.pathname, location.search],
  );
  const routeKey = `${location.pathname}${location.search}`;
  const [manualOpen, setManualOpen] = useState<{ route: string; keys: string[] } | null>(null);
  const openKeys = manualOpen?.route === routeKey ? manualOpen.keys : activeOpen;

  const crumb = (to: string, label: string) => (
    <Link to={to} style={{ color: brandColors.primary }}>
      {label}
    </Link>
  );
  const breadcrumbItems = settingsMatch
    ? [
        { title: crumb('/', 'Home') },
        { title: crumb('/settings', 'Settings') },
        { title: crumb('/settings', settingsMatch.group.label ?? 'Settings') },
        { title: settingsMatch.item.label },
      ]
    : location.pathname === '/settings'
      ? [{ title: crumb('/', 'Home') }, { title: 'Settings' }]
      : [
          { title: 'Home' },
          ...matches
            .map((match) => (match.handle as RouteHandle)?.title)
            .filter((title): title is string => Boolean(title) && title !== 'Dashboard')
            .map((title) => ({ title })),
        ];

  const signOut = () => logout.mutate(undefined, { onSettled: () => navigate('/login', { replace: true }) });

  const userMenu: MenuProps['items'] = [
    {
      key: 'profile',
      disabled: true,
      label: (
        <Flex vertical>
          <Typography.Text strong>{user?.fullName}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {user?.roles.join(', ')}
          </Typography.Text>
        </Flex>
      ),
    },
    { type: 'divider' },
    { key: 'change-password', icon: <KeyOutlined />, label: 'Change password' },
    { key: 'logout-all', icon: <DisconnectOutlined />, label: 'Sign out of all devices' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Sign out', danger: true },
  ];

  const onUserMenu: MenuProps['onClick'] = ({ key }) => {
    if (key === 'change-password') navigate('/change-password');
    if (key === 'logout') signOut();
    if (key === 'logout-all') {
      modal.confirm({
        title: 'Sign out of all devices?',
        content: 'You will be signed out everywhere, including this browser.',
        okText: 'Sign out everywhere',
        onOk: () => logoutAll.mutateAsync().finally(() => navigate('/login', { replace: true })),
      });
    }
  };

  const brand = (showName: boolean) => (
    <Flex align="center" gap={10} style={{ height: 64, padding: '0 20px', overflow: 'hidden' }}>
      <img src="/favicon.svg" alt="WIT HRMS" width={32} height={32} />
      {showName && (
        <Typography.Text strong style={{ fontSize: 16, whiteSpace: 'nowrap' }}>
          WIT HRMS
        </Typography.Text>
      )}
    </Flex>
  );

  const onOpenChange = (keys: string[]) => {
    const added = keys.filter((key) => !openKeys.includes(key));
    const rootOf = (key: string) => (key === 'documents' ? 'employees' : key);
    const root = added.length ? rootOf(added[added.length - 1]) : undefined;
    const next = root ? keys.filter((key) => rootOf(key) === root) : keys;
    setManualOpen({ route: routeKey, keys: next });
  };

  const navigation = (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Menu
          mode="inline"
          inlineCollapsed={isMobile ? false : collapsed}
          items={menuItems}
          selectedKeys={[selectedKey]}
          openKeys={collapsed && !isMobile ? undefined : openKeys}
          onOpenChange={onOpenChange}
          onClick={({ key }) => {
            if (!key.startsWith('/')) return;
            navigate(key);
            setMobileMenuOpen(false);
          }}
          style={{ borderInlineEnd: 0 }}
        />
      </div>
      {showSettings && (
        <div style={{ borderTop: `1px solid ${brandColors.border}` }}>
          <Menu
            mode="inline"
            inlineCollapsed={isMobile ? false : collapsed}
            items={[{ key: '/settings', icon: settingsNavItem.icon, label: settingsNavItem.label }]}
            selectedKeys={selectedKey === '/settings' ? ['/settings'] : []}
            onClick={() => {
              navigate('/settings');
              setMobileMenuOpen(false);
            }}
            style={{ borderInlineEnd: 0 }}
          />
        </div>
      )}
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {isMobile ? (
        <Drawer
          placement="left"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          size={260}
          closable={false}
          styles={{ body: { padding: 0 } }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {brand(true)}
            {navigation}
          </div>
        </Drawer>
      ) : (
        <div style={{ position: 'sticky', top: 0, height: '100vh', flex: '0 0 auto', zIndex: 10 }}>
          <Sider
            width={240}
            collapsedWidth={72}
            collapsible
            trigger={null}
            collapsed={collapsed}
            style={{
              borderRight: `1px solid ${brandColors.border}`,
              height: '100%',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {brand(!collapsed)}
              {navigation}
            </div>
          </Sider>
          <Button
            shape="circle"
            size="small"
            aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
            icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
            onClick={() => setCollapsed((value) => !value)}
            style={{
              position: 'absolute',
              top: 20,
              right: -12,
              zIndex: 2,
              color: brandColors.textSecondary,
              borderColor: brandColors.border,
              background: '#fff',
            }}
          />
        </div>
      )}

      <Layout>
        <Header style={{ borderBottom: `1px solid ${brandColors.border}` }}>
          <Flex align="center" justify={isMobile ? 'space-between' : 'flex-end'} style={{ height: '100%' }}>
            {isMobile && (
              <Button
                type="text"
                aria-label="Open menu"
                icon={<MenuOutlined />}
                onClick={() => setMobileMenuOpen(true)}
              />
            )}
            <Flex align="center" gap={4}>
              {isDemoMode() && <DemoTools />}
              <NotificationBell />
            <Dropdown
              menu={{ items: userMenu, onClick: onUserMenu }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button type="text" style={{ height: 48 }} aria-label="User menu">
                <Flex align="center" gap={8}>
                  <Avatar icon={<UserOutlined />} style={{ backgroundColor: brandColors.secondary }} />
                  {!isMobile && <Typography.Text>{user?.fullName}</Typography.Text>}
                  <DownOutlined style={{ fontSize: 10 }} />
                </Flex>
              </Button>
            </Dropdown>
            </Flex>
          </Flex>
        </Header>

        <Content style={{ padding: isMobile ? 16 : 24 }}>
          <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
