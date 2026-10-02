/** Mirrors WIT.HRMS.Domain.Authorization.Permissions – keep in sync when modules are added. */
export const Permissions = {
  Users: {
    View: 'Users.View',
    Create: 'Users.Create',
    Edit: 'Users.Edit',
    Delete: 'Users.Delete',
  },
  Roles: {
    View: 'Roles.View',
    Create: 'Roles.Create',
    Edit: 'Roles.Edit',
    Delete: 'Roles.Delete',
  },
  AuditLogs: {
    View: 'AuditLogs.View',
  },
  Employees: {
    View: 'Employees.View',
    Create: 'Employees.Create',
    Edit: 'Employees.Edit',
    Delete: 'Employees.Delete',
    ManageActions: 'Employees.ManageActions',
    Import: 'Employees.Import',
    Export: 'Employees.Export',
    Configure: 'Employees.Configure',
  },
  Organization: {
    View: 'Organization.View',
    Create: 'Organization.Create',
    Edit: 'Organization.Edit',
    Delete: 'Organization.Delete',
  },
  MasterData: {
    View: 'MasterData.View',
    Create: 'MasterData.Create',
    Edit: 'MasterData.Edit',
    Delete: 'MasterData.Delete',
  },
} as const;

/** The four CRUD permissions of one module. */
export interface CrudPermissions {
  View: string;
  Create: string;
  Edit: string;
  Delete: string;
}
