/** Sidebar data now lives in navConfig. This file re-exports it for older imports. */
export {
  bestPath,
  canSeeSettings,
  collectPaths,
  filterGroups,
  filterItems,
  findOpenKeys,
  groupsToMenuItems,
  pathMatches,
  settingsGroups,
  settingsNavItem,
  sidebarGroups,
  type NavGroup,
  type NavItem,
  type NavRole,
} from './navConfig';
