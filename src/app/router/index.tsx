import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { RequirePermission } from '@/features/auth/components/RequirePermission';
import { AuthLayout } from '@/layouts/AuthLayout';
import { MainLayout } from '@/layouts/MainLayout';
import { Permissions } from '@/shared/auth/permissions';
import { PageLoader } from '@/shared/components';

// Pages are lazy-loaded so each module is downloaded only when opened.
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage'));
const ChangePasswordPage = lazy(() => import('@/features/auth/pages/ChangePasswordPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const UsersPage = lazy(() => import('@/features/users/pages/UsersPage'));
const RolesPage = lazy(() => import('@/features/roles/pages/RolesPage'));
const RolePermissionsPage = lazy(() => import('@/features/roles/pages/RolePermissionsPage'));
const AuditLogsPage = lazy(() => import('@/features/audit/pages/AuditLogsPage'));
const LoginHistoryPage = lazy(() => import('@/features/audit/pages/LoginHistoryPage'));
const OrganizationSetupPage = lazy(() => import('@/features/organization/pages/OrganizationSetupPage'));
const MasterDataPage = lazy(() => import('@/features/master-data/pages/MasterDataPage'));
const EmployeesPage = lazy(() => import('@/features/employees/pages/EmployeesPage'));
const EmployeeFormPage = lazy(() => import('@/features/employees/pages/EmployeeFormPage'));
const EmployeeProfilePage = lazy(() => import('@/features/employees/pages/EmployeeProfilePage'));
const EmployeeImportPage = lazy(() => import('@/features/employees/pages/EmployeeImportPage'));
const CustomFieldsPage = lazy(() => import('@/features/employees/pages/CustomFieldsPage'));
const MissingDocumentsPage = lazy(() => import('@/features/documents/pages/MissingDocumentsPage'));
const ExpiringDocumentsPage = lazy(() => import('@/features/documents/pages/ExpiringDocumentsPage'));
const DocumentTypesPage = lazy(() => import('@/features/documents/pages/DocumentTypesPage'));
const DailyAttendancePage = lazy(() => import('@/features/attendance/pages/DailyAttendancePage'));
const MonthlyAttendancePage = lazy(() => import('@/features/attendance/pages/MonthlyAttendancePage'));
const CorrectionsPage = lazy(() => import('@/features/attendance/pages/CorrectionsPage'));
const ImportAttendancePage = lazy(() => import('@/features/attendance/pages/ImportAttendancePage'));
const ShiftsPage = lazy(() => import('@/features/attendance/pages/ShiftsPage'));
const HolidaysPage = lazy(() => import('@/features/attendance/pages/HolidaysPage'));
const AttendancePolicyPage = lazy(() => import('@/features/attendance/pages/AttendancePolicyPage'));
const LeaveRequestsPage = lazy(() => import('@/features/leave/pages/LeaveRequestsPage'));
const LeaveCalendarPage = lazy(() => import('@/features/leave/pages/LeaveCalendarPage'));
const LeaveBalancesPage = lazy(() => import('@/features/leave/pages/LeaveBalancesPage'));
const LeaveTypesPage = lazy(() => import('@/features/leave/pages/LeaveTypesPage'));
const VacanciesPage = lazy(() => import('@/features/recruitment/pages/VacanciesPage'));
const PipelinePage = lazy(() => import('@/features/recruitment/pages/PipelinePage'));
const CandidatePage = lazy(() => import('@/features/recruitment/pages/CandidatePage'));
const ConvertPage = lazy(() => import('@/features/recruitment/pages/ConvertPage'));
const OnboardingDashboardPage = lazy(() => import('@/features/onboarding/pages/OnboardingDashboardPage'));
const JoinerPage = lazy(() => import('@/features/onboarding/pages/JoinerPage'));
const MyTasksPage = lazy(() => import('@/features/onboarding/pages/MyTasksPage'));
const TemplatesPage = lazy(() => import('@/features/onboarding/pages/TemplatesPage'));
const ProbationDashboardPage = lazy(() => import('@/features/probation/pages/ProbationDashboardPage'));
const ProbationReviewPage = lazy(() => import('@/features/probation/pages/ProbationReviewPage'));
const PayrollRunsPage = lazy(() => import('@/features/payroll/pages/PayrollRunsPage'));
const PayrollRunPage = lazy(() => import('@/features/payroll/pages/PayrollRunPage'));
const PayslipPage = lazy(() => import('@/features/payroll/pages/PayslipPage'));
const SalarySetupPage = lazy(() => import('@/features/payroll/pages/SalarySetupPage'));
const SalaryMasterPage = lazy(() => import('@/features/payroll/pages/SalaryMasterPage'));
const PayslipsPage = lazy(() => import('@/features/payroll/pages/PayslipsPage'));
const PayrollHistoryPage = lazy(() => import('@/features/payroll/pages/PayrollHistoryPage'));
const EssHomePage = lazy(() => import('@/features/ess/pages/EssHomePage'));
const EssProfilePage = lazy(() => import('@/features/ess/pages/EssProfilePage'));
const EssAttendancePage = lazy(() => import('@/features/ess/pages/EssAttendancePage'));
const EssLeavePage = lazy(() => import('@/features/ess/pages/EssLeavePage'));
const EssPayslipsPage = lazy(() => import('@/features/ess/pages/EssPayslipsPage'));
const EssDocumentsPage = lazy(() => import('@/features/ess/pages/EssDocumentsPage'));
const EssRequestsPage = lazy(() => import('@/features/ess/pages/EssRequestsPage'));
const EssAnnouncementsPage = lazy(() => import('@/features/ess/pages/EssAnnouncementsPage'));
const ManagerHomePage = lazy(() => import('@/features/mss/pages/ManagerHomePage'));
const ManagerTeamPage = lazy(() => import('@/features/mss/pages/ManagerTeamPage'));
const ManagerAttendancePage = lazy(() => import('@/features/mss/pages/ManagerAttendancePage'));
const ManagerLeavePage = lazy(() => import('@/features/mss/pages/ManagerLeavePage'));
const ManagerInboxPage = lazy(() => import('@/features/mss/pages/ManagerInboxPage'));
const NotificationHistoryPage = lazy(() => import('@/features/notifications/pages/NotificationHistoryPage'));
const AlertTemplatesPage = lazy(() => import('@/features/notifications/pages/AlertTemplatesPage'));
const ExitTrackerPage = lazy(() => import('@/features/offboarding/pages/ExitTrackerPage'));
const ExitCasePage = lazy(() => import('@/features/offboarding/pages/ExitCasePage'));
const ResignationPage = lazy(() => import('@/features/offboarding/pages/ResignationPage'));
const ReportsPage = lazy(() => import('@/features/reports/pages/ReportsPage'));
const ApiClientsPage = lazy(() => import('@/features/integrations/pages/ApiClientsPage'));
const IntegrationMonitorPage = lazy(() => import('@/features/integrations/pages/IntegrationMonitorPage'));
const ProductTourPage = lazy(() => import('@/features/tour/pages/ProductTourPage'));
const SettingsHomePage = lazy(() => import('@/features/settings/pages/SettingsHomePage'));
const ComingNextPage = lazy(() => import('@/features/settings/pages/ComingNextPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const page = (element: ReactNode) => <Suspense fallback={<PageLoader />}>{element}</Suspense>;
const guarded = (permission: string, element: ReactNode) =>
  page(<RequirePermission permission={permission}>{element}</RequirePermission>);

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: page(<LoginPage />) },
      { path: '/forgot-password', element: page(<ForgotPasswordPage />) },
      { path: '/reset-password', element: page(<ResetPasswordPage />) },
      { path: '/change-password', element: <RequireAuth>{page(<ChangePasswordPage />)}</RequireAuth> },
    ],
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: page(<DashboardPage />), handle: { title: 'Dashboard' } },
      { path: 'users', element: guarded(Permissions.Users.View, <UsersPage />), handle: { title: 'Users' } },
      {
        path: 'roles',
        element: guarded(Permissions.Roles.View, <RolesPage />),
        handle: { title: 'Roles & Permissions' },
      },
      {
        path: 'roles/:id/permissions',
        element: guarded(Permissions.Roles.View, <RolePermissionsPage />),
        handle: { title: 'Permissions' },
      },
      {
        path: 'audit-logs',
        element: guarded(Permissions.AuditLogs.View, <AuditLogsPage />),
        handle: { title: 'Audit Logs' },
      },
      {
        path: 'login-history',
        element: guarded(Permissions.AuditLogs.View, <LoginHistoryPage />),
        handle: { title: 'Login History' },
      },
      {
        path: 'employees',
        element: guarded(Permissions.Employees.View, <EmployeesPage />),
        handle: { title: 'Employee directory' },
      },
      {
        path: 'employees/new',
        element: guarded(Permissions.Employees.Create, <EmployeeFormPage />),
        handle: { title: 'Add employee' },
      },
      {
        path: 'employees/import',
        element: guarded(Permissions.Employees.Import, <EmployeeImportPage />),
        handle: { title: 'Import employees' },
      },
      {
        path: 'employees/:id',
        element: guarded(Permissions.Employees.View, <EmployeeProfilePage />),
        handle: { title: 'Employee' },
      },
      {
        path: 'employees/:id/edit',
        element: guarded(Permissions.Employees.Edit, <EmployeeFormPage />),
        handle: { title: 'Edit employee' },
      },
      {
        path: 'settings/custom-fields',
        element: guarded(Permissions.Employees.Configure, <CustomFieldsPage />),
        handle: { title: 'Custom HR Fields' },
      },
      {
        path: 'settings/organization',
        element: guarded(Permissions.Organization.View, <OrganizationSetupPage />),
        handle: { title: 'Organization Setup' },
      },
      {
        path: 'settings/master-data',
        element: guarded(Permissions.MasterData.View, <MasterDataPage />),
        handle: { title: 'Master Data' },
      },
      {
        path: 'documents/missing',
        element: page(<MissingDocumentsPage />),
        handle: { title: 'Missing documents' },
      },
      {
        path: 'documents/expiring',
        element: page(<ExpiringDocumentsPage />),
        handle: { title: 'Expiring documents' },
      },
      {
        path: 'settings/document-types',
        element: page(<DocumentTypesPage />),
        handle: { title: 'Document types' },
      },
      { path: 'attendance', element: page(<DailyAttendancePage />), handle: { title: 'Daily attendance' } },
      { path: 'attendance/month', element: page(<MonthlyAttendancePage />), handle: { title: 'Monthly attendance' } },
      { path: 'attendance/corrections', element: page(<CorrectionsPage />), handle: { title: 'Correction requests' } },
      { path: 'attendance/import', element: page(<ImportAttendancePage />), handle: { title: 'Attendance import' } },
      { path: 'settings/shifts', element: page(<ShiftsPage />), handle: { title: 'Shifts' } },
      { path: 'settings/holidays', element: page(<HolidaysPage />), handle: { title: 'Holidays' } },
      {
        path: 'settings/attendance-policy',
        element: page(<AttendancePolicyPage />),
        handle: { title: 'Attendance policy' },
      },
      { path: 'leave', element: page(<LeaveRequestsPage />), handle: { title: 'Leave requests' } },
      { path: 'leave/calendar', element: page(<LeaveCalendarPage />), handle: { title: 'Team leave calendar' } },
      { path: 'leave/balances', element: page(<LeaveBalancesPage />), handle: { title: 'Leave balances' } },
      { path: 'settings/leave-types', element: page(<LeaveTypesPage />), handle: { title: 'Leave types' } },
      { path: 'recruitment', element: page(<VacanciesPage />), handle: { title: 'Job vacancies' } },
      { path: 'recruitment/pipeline', element: page(<PipelinePage />), handle: { title: 'Candidate pipeline' } },
      { path: 'recruitment/candidates/:id', element: page(<CandidatePage />), handle: { title: 'Candidate' } },
      {
        path: 'recruitment/candidates/:id/convert',
        element: page(<ConvertPage />),
        handle: { title: 'Convert to employee' },
      },
      { path: 'onboarding', element: page(<OnboardingDashboardPage />), handle: { title: 'Onboarding progress' } },
      { path: 'onboarding/tasks', element: page(<MyTasksPage />), handle: { title: 'Onboarding checklist' } },
      { path: 'onboarding/:id', element: page(<JoinerPage />), handle: { title: 'Joiner' } },
      { path: 'settings/onboarding-templates', element: page(<TemplatesPage />), handle: { title: 'Onboarding templates' } },
      { path: 'probation', element: page(<ProbationDashboardPage />), handle: { title: 'Probation' } },
      { path: 'probation/:employeeCode', element: page(<ProbationReviewPage />), handle: { title: 'Probation review' } },
      { path: 'payroll/salary-master', element: page(<SalaryMasterPage />), handle: { title: 'Salary master' } },
      { path: 'payroll/structures', element: page(<SalarySetupPage />), handle: { title: 'Salary structures' } },
      { path: 'payroll/payslips', element: page(<PayslipsPage />), handle: { title: 'Payslips' } },
      { path: 'payroll/history', element: page(<PayrollHistoryPage />), handle: { title: 'Payroll history' } },
      { path: 'payroll/summary', element: <Navigate to="/reports?report=payroll-summary" replace /> },
      { path: 'payroll/runs/:runId/:employeeCode', element: page(<PayslipPage />), handle: { title: 'Payslip' } },
      { path: 'payroll/runs/:runId', element: page(<PayrollRunPage />), handle: { title: 'Monthly payroll' } },
      { path: 'payroll', element: page(<PayrollRunsPage />), handle: { title: 'Monthly payroll' } },
      { path: 'settings/salary', element: <Navigate to="/payroll/structures" replace /> },
      { path: 'ess', element: page(<EssHomePage />), handle: { title: 'Employee self-service' } },
      { path: 'ess/profile', element: page(<EssProfilePage />), handle: { title: 'My profile' } },
      { path: 'ess/attendance', element: page(<EssAttendancePage />), handle: { title: 'My attendance' } },
      { path: 'ess/leave', element: page(<EssLeavePage />), handle: { title: 'My leave' } },
      { path: 'ess/payslips/:runId', element: page(<EssPayslipsPage />), handle: { title: 'My payslip' } },
      { path: 'ess/payslips', element: page(<EssPayslipsPage />), handle: { title: 'My payslips' } },
      { path: 'ess/documents', element: page(<EssDocumentsPage />), handle: { title: 'My documents' } },
      { path: 'ess/requests', element: page(<EssRequestsPage />), handle: { title: 'HR requests' } },
      { path: 'ess/announcements', element: page(<EssAnnouncementsPage />), handle: { title: 'Announcements' } },
      { path: 'ess/resign', element: page(<ResignationPage />), handle: { title: 'Resign' } },
      { path: 'manager', element: page(<ManagerHomePage />), handle: { title: 'Manager self-service' } },
      { path: 'manager/team', element: page(<ManagerTeamPage />), handle: { title: 'Team directory' } },
      { path: 'manager/attendance', element: page(<ManagerAttendancePage />), handle: { title: 'Team attendance' } },
      { path: 'manager/leave', element: page(<ManagerLeavePage />), handle: { title: 'Team leave' } },
      { path: 'manager/inbox', element: page(<ManagerInboxPage />), handle: { title: 'Approvals inbox' } },
      { path: 'notifications', element: page(<NotificationHistoryPage />), handle: { title: 'Notification history' } },
      { path: 'settings/alerts', element: page(<AlertTemplatesPage />), handle: { title: 'Alert templates' } },
      { path: 'offboarding/:id', element: page(<ExitCasePage />), handle: { title: 'Exit' } },
      { path: 'offboarding', element: page(<ExitTrackerPage />), handle: { title: 'Offboarding' } },
      { path: 'reports', element: page(<ReportsPage />), handle: { title: 'Reports' } },
      { path: 'settings/api-clients', element: page(<ApiClientsPage />), handle: { title: 'API clients' } },
      { path: 'integrations', element: page(<IntegrationMonitorPage />), handle: { title: 'Integration monitor' } },
      { path: 'tour', element: page(<ProductTourPage />), handle: { title: 'Product tour' } },
      { path: 'settings', element: page(<SettingsHomePage />), handle: { title: 'Settings' } },
      {
        path: 'settings/approval-authority',
        element: page(<ComingNextPage />),
        handle: { title: 'Approval authority' },
      },
      {
        path: 'settings/login-rules',
        element: page(<ComingNextPage />),
        handle: { title: 'Login and session controls' },
      },
      { path: '*', element: page(<NotFoundPage />), handle: { title: 'Not found' } },
    ],
  },
]);
