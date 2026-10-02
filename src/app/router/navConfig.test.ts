import { describe, expect, it } from 'vitest';
import { canSeeSettings, filterGroups, settingsGroups, sidebarGroups } from './navConfig';

function itemLabels(role: Parameters<typeof filterGroups>[1]) {
  return filterGroups(sidebarGroups, role).flatMap((group) => group.items.map((item) => item.label));
}

describe('sidebar roles', () => {
  it('shows the staff sidebar to Super Admin, without self-service', () => {
    expect(itemLabels('super-admin')).toEqual([
      'Home',
      'Employees',
      'Recruitment',
      'Onboarding',
      'Attendance',
      'Leave',
      'Payroll',
      'Reports',
    ]);
    const employees = filterGroups(sidebarGroups, 'super-admin')[0].items.find((item) => item.key === 'employees');
    expect(employees?.children?.map((item) => item.label)).toEqual([
      'Employee directory',
      'Documents',
      'Probation',
      'Offboarding',
    ]);
    const payroll = filterGroups(sidebarGroups, 'super-admin')[0].items.find((item) => item.key === 'payroll');
    expect(payroll?.children?.map((item) => item.label)).toEqual([
      'Salary master',
      'Salary structures',
      'Monthly payroll',
      'Payslips',
      'Payroll history',
    ]);
    expect(canSeeSettings('super-admin')).toBe(true);
  });

  it('hides the web sidebar from employee and manager roles', () => {
    expect(itemLabels('employee')).toEqual([]);
    expect(itemLabels('manager')).toEqual([]);
    expect(canSeeSettings('employee')).toBe(false);
  });

  it('limits finance to home, payroll, reports, and offboarding', () => {
    const finance = filterGroups(sidebarGroups, 'finance')[0].items;
    expect(finance.map((item) => item.label)).toEqual(['Home', 'Employees', 'Payroll', 'Reports']);
    expect(finance.find((item) => item.key === 'employees')?.children?.map((item) => item.label)).toEqual(['Offboarding']);
    expect(canSeeSettings('finance')).toBe(false);
  });

  it('limits management to home and reports', () => {
    expect(itemLabels('management')).toEqual(['Home', 'Reports']);
  });

  it('gives HR the working settings groups and Super Admin the access groups', () => {
    const hr = filterGroups(settingsGroups, 'hr-admin').map((group) => group.label);
    expect(hr).toEqual([
      'Organization',
      'Attendance',
      'Leave',
      'Payroll',
      'Documents',
      'Onboarding',
      'Notifications',
    ]);
    const superGroups = filterGroups(settingsGroups, 'super-admin').map((group) => group.label);
    expect(superGroups).toEqual([
      'Organization',
      'Users and access',
      'Attendance',
      'Leave',
      'Payroll',
      'Documents',
      'Onboarding',
      'Notifications',
      'Integrations',
      'Data',
    ]);
  });
});
