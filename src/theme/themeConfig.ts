import type { ThemeConfig } from 'antd';

/**
 * WIT HRMS design tokens.
 * Primary: light/medium blue · Secondary: light green · Text: charcoal.
 * Change colours here only – every Ant Design component picks them up.
 */
export const brandColors = {
  primary: '#2B7BCB',
  primaryLight: '#E8F2FC',
  secondary: '#52B788',
  secondaryLight: '#E9F7EF',
  text: '#2B2B2B',
  textSecondary: '#5F6B76',
  background: '#F4F8FB',
  border: '#DCE6EF',
} as const;

export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: brandColors.primary,
    colorSuccess: brandColors.secondary,
    colorInfo: brandColors.primary,
    colorText: brandColors.text,
    colorTextSecondary: brandColors.textSecondary,
    colorBgLayout: brandColors.background,
    colorBorderSecondary: brandColors.border,
    borderRadius: 8,
    fontFamily:
      "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  components: {
    Layout: {
      siderBg: '#FFFFFF',
      headerBg: '#FFFFFF',
      headerPadding: '0 24px',
    },
    Menu: {
      itemSelectedBg: brandColors.primaryLight,
      itemSelectedColor: brandColors.primary,
    },
    Table: {
      headerBg: brandColors.primaryLight,
    },
  },
};
