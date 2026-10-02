import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { AuthResponse, CurrentUser } from '@/features/auth/types';
import { ROSTER } from '@/features/offboarding/roster';
import { Permissions } from '@/shared/auth/permissions';
import { useAuthStore } from '@/stores/authStore';
import type { PaginationMeta } from './types';

/**
 * Demo answers for the existing API client. The feature API modules stay as they are.
 * Set VITE_DEMO_MODE=false to send these calls to the real server again.
 */

const NOW = '2026-09-23T05:56:00.000Z';

interface Row {
  id: number;
  [key: string]: unknown;
}

const buckets = new Map<string, Row[]>();
let nextId = 200;

function stamp(extra: Record<string, unknown> = {}): Record<string, unknown> {
  return { description: null, isActive: true, createdAt: NOW, updatedAt: null, ...extra };
}

function emailOf(name: string) {
  const slug = name.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '');
  return `${slug}@worldinfotek.com`;
}

function seedEmployees(): Row[] {
  return ROSTER.map((person, index) => {
    const id = index + 1;
    const intern = person.designation === 'Intern';
    const [firstName, ...rest] = person.name.split(' ');
    return {
      id,
      employeeCode: person.code,
      fullName: person.name,
      firstName,
      middleName: null,
      lastName: rest.join(' ') || firstName,
      fatherName: null,
      genderId: 1,
      gender: 'Male',
      dateOfBirth: null,
      maritalStatusId: null,
      maritalStatus: null,
      bloodGroupId: null,
      bloodGroup: null,
      nationalityId: 1,
      nationality: 'Pakistani',
      cnic: null,
      workEmail: emailOf(person.name),
      personalEmail: null,
      mobilePhone: null,
      workPhone: null,
      hasPhoto: false,
      companyId: 1,
      company: 'World Infotek Solutions',
      joiningDate: intern ? '2026-06-01' : '2023-03-01',
      employmentTypeId: intern ? 3 : 1,
      employmentType: intern ? 'Intern' : 'Permanent',
      branchId: 1,
      branch: 'Head office',
      departmentId: departmentId(person.department),
      department: person.department,
      teamId: null,
      team: null,
      designationId: designationId(person.designation),
      designation: person.designation,
      grade: null,
      reportingManagerId: id === 1 ? null : 1,
      reportingManager: id === 1 ? null : 'Imran Qureshi',
      reportingManagerCode: id === 1 ? null : 'WIT-0001',
      employeeStatusId: intern ? 2 : 1,
      status: intern ? 'Probation' : 'Active',
      statusCode: intern ? 'PROBATION' : 'ACTIVE',
      statusColor: intern ? 'gold' : 'green',
      isActiveEmployment: true,
      probationEndDate: intern ? '2026-12-01' : null,
      confirmationDate: intern ? null : '2023-09-01',
      exitDate: null,
      directReportCount: id === 1 ? ROSTER.length - 1 : 0,
      currentAddress: null,
      permanentAddress: null,
      emergencyContacts: [],
      customFields: [],
      userId: id <= 2 ? id : null,
      userName: id === 1 ? 'superadmin' : id === 2 ? 'sana.tariq' : null,
      userIsActive: id <= 2 ? true : null,
      createdAt: NOW,
      updatedAt: null,
    };
  });
}

const departmentNames: string[] = [...new Set(ROSTER.map((person) => person.department))];
const designationNames: string[] = [...new Set(ROSTER.map((person) => person.designation))];

function departmentId(name: string) {
  return departmentNames.indexOf(name) + 1;
}

function designationId(name: string) {
  return designationNames.indexOf(name) + 1;
}

function seedDepartments(): Row[] {
  return departmentNames.map((name, index) => ({
    id: index + 1,
    code: name.slice(0, 3).toUpperCase(),
    name,
    companyId: 1,
    companyName: 'World Infotek Solutions',
    parentId: null,
    parentName: null,
    childCount: 0,
    teamCount: 0,
    ...stamp(),
  }));
}

function seedDesignations(): Row[] {
  return designationNames.map((name, index) => ({
    id: index + 1,
    code: `D${index + 1}`,
    name,
    grade: null,
    level: index + 1,
    ...stamp(),
  }));
}

function seed() {
  buckets.set('companies', [
    {
      id: 1,
      code: 'WIT',
      name: 'World Infotek Solutions',
      legalName: 'World Infotek Solutions',
      registrationNumber: null,
      taxNumber: null,
      email: 'hr@worldinfotek.com',
      phone: null,
      website: null,
      address: null,
      countryId: 1,
      countryName: 'Pakistan',
      cityId: 1,
      cityName: 'Lahore',
      branchCount: 1,
      departmentCount: departmentNames.length,
      ...stamp(),
    },
  ]);
  buckets.set('branches', [
    {
      id: 1,
      code: 'HO',
      name: 'Head office',
      companyId: 1,
      companyName: 'World Infotek Solutions',
      isHeadOffice: true,
      address: 'Lahore',
      countryId: 1,
      countryName: 'Pakistan',
      cityId: 1,
      cityName: 'Lahore',
      phone: null,
      email: null,
      ...stamp(),
    },
  ]);
  buckets.set('departments', seedDepartments());
  buckets.set('teams', [
    {
      id: 1,
      code: 'GEN',
      name: 'General',
      departmentId: departmentId('Software Development'),
      departmentName: 'Software Development',
      companyId: 1,
      ...stamp(),
    },
  ]);
  buckets.set('designations', seedDesignations());
  buckets.set('employment-types', [
    { id: 1, code: 'PERM', name: 'Permanent', ...stamp() },
    { id: 2, code: 'CONT', name: 'Contract', ...stamp() },
    { id: 3, code: 'INTERN', name: 'Intern', ...stamp() },
  ]);
  buckets.set('employee-statuses', [
    { id: 1, code: 'ACTIVE', name: 'Active', color: 'green', isActiveEmployment: true, ...stamp({ isSystem: true }) },
    { id: 2, code: 'PROBATION', name: 'Probation', color: 'gold', isActiveEmployment: true, ...stamp({ isSystem: true }) },
    { id: 3, code: 'RESIGNED', name: 'Resigned', color: 'default', isActiveEmployment: false, ...stamp({ isSystem: true }) },
  ]);
  buckets.set('employees', seedEmployees());
  buckets.set('users', [
    {
      id: 1,
      userName: 'superadmin',
      fullName: 'System Administrator',
      email: 'superadmin@worldinfotek.com',
      phoneNumber: null,
      isActive: true,
      isLockedOut: false,
      mustChangePassword: false,
      lastLoginAt: NOW,
      createdAt: NOW,
      roles: ['Super Admin'],
      roleIds: [1],
      lockoutEndUtc: null,
      passwordChangedAt: NOW,
      employeeId: null,
      createdBy: null,
      updatedAt: null,
      updatedBy: null,
    },
    {
      id: 2,
      userName: 'sana.tariq',
      fullName: 'Sana Tariq',
      email: emailOf('Sana Tariq'),
      phoneNumber: null,
      isActive: true,
      isLockedOut: false,
      mustChangePassword: false,
      lastLoginAt: null,
      createdAt: NOW,
      roles: ['HR Admin'],
      roleIds: [2],
      lockoutEndUtc: null,
      passwordChangedAt: null,
      employeeId: 2,
      createdBy: 'superadmin',
      updatedAt: null,
      updatedBy: null,
    },
  ]);
  const permissionCodes = allPermissionCodes();
  buckets.set('roles', [
    {
      id: 1,
      name: 'Super Admin',
      description: 'Full access',
      isSystem: true,
      isSuperAdmin: true,
      dataScope: 'All',
      userCount: 1,
      permissionCount: permissionCodes.length,
      permissions: permissionCodes,
      createdAt: NOW,
      updatedAt: null,
    },
    {
      id: 2,
      name: 'HR Admin',
      description: 'HR operations',
      isSystem: true,
      isSuperAdmin: false,
      dataScope: 'All',
      userCount: 1,
      permissionCount: permissionCodes.length,
      permissions: permissionCodes,
      createdAt: NOW,
      updatedAt: null,
    },
    {
      id: 3,
      name: 'Employee',
      description: 'Own records',
      isSystem: true,
      isSuperAdmin: false,
      dataScope: 'Own',
      userCount: 0,
      permissionCount: 0,
      permissions: [],
      createdAt: NOW,
      updatedAt: null,
    },
  ]);
  buckets.set('lookup-types', [
    { id: 1, code: 'GENDER', name: 'Gender', parentTypeId: null, ...stamp({ isSystem: true }) },
    { id: 2, code: 'COUNTRY', name: 'Country', parentTypeId: null, ...stamp({ isSystem: true }) },
  ]);
  buckets.set('lookup-values', [
    { id: 1, code: 'M', name: 'Male', lookupTypeId: 1, sortOrder: 1, ...stamp() },
    { id: 2, code: 'F', name: 'Female', lookupTypeId: 1, sortOrder: 2, ...stamp() },
    { id: 3, code: 'PK', name: 'Pakistan', lookupTypeId: 2, sortOrder: 1, ...stamp() },
  ]);
  buckets.set('custom-fields', []);
  buckets.set('audit-logs', [
    {
      id: 1,
      occurredAt: NOW,
      action: 'Update',
      entityName: 'Employee',
      entityId: '1',
      changedColumns: 'Department',
      userId: '1',
      userName: 'superadmin',
      ipAddress: '127.0.0.1',
      oldValues: null,
      newValues: null,
      correlationId: null,
    },
  ]);
  buckets.set('login-history', [
    {
      id: 1,
      occurredAt: NOW,
      userId: 1,
      userName: 'superadmin',
      succeeded: true,
      failureReason: null,
      ipAddress: '127.0.0.1',
      userAgent: 'Demo',
    },
  ]);
}

function rows(name: string): Row[] {
  if (buckets.size === 0) seed();
  return buckets.get(name) ?? [];
}

function allPermissionCodes() {
  return Object.values(Permissions).flatMap((group) => Object.values(group));
}

function demoUser(typed: string): CurrentUser {
  const name = typed.trim() || 'Demo';
  return {
    id: 1,
    userName: name,
    fullName: name.includes('@') ? name.split('@')[0] : name,
    email: name.includes('@') ? name : emailOf(name),
    mustChangePassword: false,
    isSuperAdmin: true,
    dataScope: 'All',
    roles: ['Super Admin'],
    permissions: allPermissionCodes(),
  };
}

function authResponse(typed: string): AuthResponse {
  return {
    accessToken: 'demo-token',
    accessTokenExpiresAt: '2099-01-01T00:00:00.000Z',
    user: demoUser(typed),
  };
}

function paramsOf(config: InternalAxiosRequestConfig): Record<string, unknown> {
  const params = config.params;
  if (!params || typeof params !== 'object') return {};
  return params as Record<string, unknown>;
}

function bodyOf(data: unknown): Record<string, unknown> {
  if (!data || data instanceof FormData) return {};
  if (typeof data === 'string') {
    try {
      return JSON.parse(data) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (typeof data === 'object') return data as Record<string, unknown>;
  return {};
}

function page(items: Row[], params: Record<string, unknown>) {
  const pageNumber = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? (items.length || 1));
  const search = String(params.search ?? '').trim().toLowerCase();
  let filtered = items;
  if (search) {
    filtered = items.filter((item) => JSON.stringify(item).toLowerCase().includes(search));
  }
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '' || key === 'page' || key === 'pageSize' || key === 'search' || key === 'sortBy' || key === 'sortOrder') {
      continue;
    }
    if (key.endsWith('Id') || key === 'isActive' || key === 'succeeded') {
      filtered = filtered.filter((item) => String(item[key]) === String(value));
    }
  }
  const start = (pageNumber - 1) * pageSize;
  const slice = filtered.slice(start, start + pageSize);
  const meta: PaginationMeta = {
    page: pageNumber,
    pageSize,
    totalCount: filtered.length,
    totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
  };
  return { data: slice, meta };
}

function employeeSummary() {
  const people = rows('employees');
  const byDepartment = new Map<string, number>();
  for (const person of people) {
    const name = String(person.department);
    byDepartment.set(name, (byDepartment.get(name) ?? 0) + 1);
  }
  return {
    activeEmployees: people.length,
    onProbation: people.filter((person) => person.status === 'Probation').length,
    probationEndingIn30Days: 1,
    joinedThisMonth: 0,
    leftThisMonth: 0,
    byDepartment: [...byDepartment.entries()].map(([name, count]) => ({ name, count })),
    byStatus: [
      { name: 'Active', count: people.filter((person) => person.status === 'Active').length, color: 'green' },
      { name: 'Probation', count: people.filter((person) => person.status === 'Probation').length, color: 'gold' },
    ],
    byEmploymentType: [
      { name: 'Permanent', count: people.filter((person) => person.employmentType === 'Permanent').length },
      { name: 'Intern', count: people.filter((person) => person.employmentType === 'Intern').length },
    ],
  };
}

function lookups(types: string) {
  const wanted = types.split(',').map((item) => item.trim()).filter(Boolean);
  const result: Record<string, unknown[]> = {};
  const map: Record<string, () => unknown[]> = {
    companies: () => rows('companies').map((item) => ({ id: item.id, code: item.code, name: item.name })),
    branches: () => rows('branches').map((item) => ({ id: item.id, code: item.code, name: item.name, parentId: item.companyId, companyId: item.companyId })),
    departments: () => rows('departments').map((item) => ({ id: item.id, code: item.code, name: item.name, parentId: item.parentId, companyId: item.companyId })),
    teams: () => rows('teams').map((item) => ({ id: item.id, code: item.code, name: item.name, parentId: item.departmentId })),
    designations: () => rows('designations').map((item) => ({ id: item.id, code: item.code, name: item.name })),
    employmentTypes: () => rows('employment-types').map((item) => ({ id: item.id, code: item.code, name: item.name })),
    employeeStatuses: () => rows('employee-statuses').map((item) => ({ id: item.id, code: item.code, name: item.name, color: item.color })),
    gender: () => [{ id: 1, code: 'M', name: 'Male' }, { id: 2, code: 'F', name: 'Female' }],
    country: () => [{ id: 1, code: 'PK', name: 'Pakistan' }],
    city: () => [{ id: 1, code: 'LHE', name: 'Lahore', parentId: 1 }],
    maritalStatus: () => [{ id: 1, code: 'SINGLE', name: 'Single' }, { id: 2, code: 'MARRIED', name: 'Married' }],
  };
  for (const type of wanted.length ? wanted : Object.keys(map)) {
    result[type] = map[type]?.() ?? [];
  }
  return result;
}

function find(collection: string, id: number) {
  return rows(collection).find((item) => item.id === id) ?? null;
}

function save(collection: string, body: Record<string, unknown>, id?: number) {
  const list = rows(collection);
  if (!buckets.has(collection)) buckets.set(collection, list);
  if (id) {
    const index = list.findIndex((item) => item.id === id);
    const next = { ...(index >= 0 ? list[index] : { id }), ...body, id, updatedAt: new Date().toISOString() };
    if (index >= 0) list[index] = next;
    else list.push(next);
    return next;
  }
  const created = { ...stamp(), ...body, id: ++nextId, createdAt: new Date().toISOString() };
  list.push(created);
  return created;
}

function remove(collection: string, id: number) {
  const list = rows(collection);
  const index = list.findIndex((item) => item.id === id);
  if (index >= 0) list.splice(index, 1);
}

interface DemoPayload {
  data: unknown;
  meta?: PaginationMeta | null;
  message?: string | null;
}

function answer(method: string, path: string, params: Record<string, unknown>, body: Record<string, unknown>): DemoPayload {
  if (buckets.size === 0) seed();
  const parts = path.split('/').filter(Boolean);

  if (path === '/auth/login') {
    return { data: authResponse(String(body.userNameOrEmail ?? body.email ?? 'Demo')) };
  }
  if (path === '/auth/me') {
    return { data: useAuthStore.getState().user };
  }
  if (path === '/auth/logout' || path === '/auth/logout-all') return { data: null };
  if (path === '/auth/forgot-password' || path === '/auth/reset-password' || path === '/auth/change-password') {
    return { data: null, message: 'Saved in this browser only. Nothing was sent to a server.' };
  }
  if (path === '/system/info') {
    return { data: { application: 'WIT HRMS', version: 'demo', environment: 'Demo', serverTimeUtc: new Date().toISOString() } };
  }
  if (path === '/lookups') return { data: lookups(String(params.types ?? '')) };
  if (path === '/lookups/catalog') {
    return {
      data: [
        { key: 'companies', name: 'Companies', source: 'organization', parentKey: null },
        { key: 'departments', name: 'Departments', source: 'organization', parentKey: 'companies' },
        { key: 'gender', name: 'Gender', source: 'lookup', parentKey: null },
      ],
    };
  }
  if (path === '/permissions') {
    return {
      data: Object.entries(Permissions).map(([module, actions]) => ({
        module,
        displayName: module.replace(/([A-Z])/g, ' $1').trim(),
        permissions: Object.entries(actions).map(([action, code]) => ({ code, action, description: code })),
      })),
    };
  }
  if (path === '/employees/summary') return { data: employeeSummary() };
  if (path === '/employees/lookup') {
    const search = String(params.search ?? '').toLowerCase();
    const excludeId = Number(params.excludeId ?? 0);
    const matches = rows('employees')
      .filter((person) => person.id !== excludeId)
      .filter((person) => !search || String(person.fullName).toLowerCase().includes(search) || String(person.employeeCode).toLowerCase().includes(search))
      .slice(0, 20)
      .map((person) => ({
        id: person.id,
        employeeCode: person.employeeCode,
        fullName: person.fullName,
        designation: person.designation,
        department: person.department,
        hasPhoto: false,
      }));
    return { data: matches };
  }
  if (path === '/employees/initial-statuses' || /\/employees\/\d+\/allowed-statuses$/.test(path)) {
    return { data: rows('employee-statuses') };
  }
  if (path === '/custom-fields/active') return { data: rows('custom-fields') };
  if (path === '/roles/lookup') {
    return { data: rows('roles').map((role) => ({ id: role.id, name: role.name, isSystem: role.isSystem })) };
  }
  if (path === '/departments/tree') {
    return {
      data: rows('departments').map((item) => ({
        id: item.id,
        companyId: item.companyId,
        parentId: item.parentId,
        code: item.code,
        name: item.name,
        isActive: item.isActive,
        teamCount: 0,
        children: [],
      })),
    };
  }
  if (path.startsWith('/employees/import')) {
    return { data: { totalRows: 0, validRows: 0, invalidRows: 0, importedRows: 0, committed: false, rows: [] }, message: 'Sample import only. The file was not saved.' };
  }

  if (parts[0] === 'employees' && parts.length === 2 && method === 'get') {
    return { data: find('employees', Number(parts[1])) };
  }
  if (parts[0] === 'employees' && parts[2] === 'timeline') {
    const person = find('employees', Number(parts[1]));
    return {
      data: person
        ? [{ id: 1, eventType: 'Joined', effectiveDate: person.joiningDate, summary: 'Joined', oldValue: null, newValue: null, remarks: null, recordedAt: NOW, recordedBy: 'demo' }]
        : [],
    };
  }
  if (parts[0] === 'employees' && parts[2] === 'actions' && method === 'post') {
    return { data: find('employees', Number(parts[1])) };
  }
  if (parts[0] === 'employees' && parts[2] === 'create-user') {
    const person = find('employees', Number(parts[1]));
    return { data: { user: { id: nextId, userName: body.userName, fullName: person?.fullName ?? body.userName, email: body.email ?? '', roleIds: body.roleIds ?? [], roles: [] }, temporaryPassword: 'Demo@12345' } };
  }
  if (parts[0] === 'users' && parts[2] === 'sessions' && method === 'get') {
    return { data: [{ id: 1, createdAt: NOW, expiresAt: '2099-01-01T00:00:00.000Z', ipAddress: '127.0.0.1', userAgent: 'Demo' }] };
  }
  if (parts[0] === 'users' && parts[2] === 'reset-password') {
    return { data: { temporaryPassword: 'Demo@12345' } };
  }
  if (parts[0] === 'roles' && parts[2] === 'permissions' && method === 'put') {
    return { data: save('roles', { permissions: body.permissions }, Number(parts[1])) };
  }

  const collection = parts[0];
  const known = buckets.has(collection) || ['companies', 'branches', 'departments', 'teams', 'designations', 'employment-types', 'employee-statuses', 'lookup-types', 'lookup-values', 'custom-fields', 'employees', 'users', 'roles', 'audit-logs', 'login-history'].includes(collection);

  if (parts.length === 3 && parts[2] === 'values') {
    return page(rows('lookup-values').filter((item) => item.lookupTypeId === Number(parts[1])), params);
  }
  if (parts.length === 3 && parts[2] === 'status' && method === 'patch') {
    return { data: save(collection, { isActive: body.isActive }, Number(parts[1])) };
  }
  if (!known) return { data: method === 'get' ? [] : body };

  if (method === 'get' && parts.length === 1) return page(rows(collection), params);
  if (method === 'get' && parts.length === 2) return { data: find(collection, Number(parts[1])) };
  if (method === 'post' && parts.length === 1 && collection === 'users') {
    const roleIds = Array.isArray(body.roleIds) ? (body.roleIds as number[]) : [];
    const roles = roleIds.map((id) => find('roles', id)?.name).filter((name): name is string => Boolean(name));
    return {
      data: {
        user: save('users', { isActive: true, isLockedOut: false, mustChangePassword: false, roles, ...body }),
        temporaryPassword: 'Demo@12345',
      },
    };
  }
  if (method === 'post' && parts.length === 1 && collection === 'employees') {
    const firstName = String(body.firstName ?? '');
    const lastName = String(body.lastName ?? '');
    return {
      data: save('employees', {
        fullName: `${firstName} ${lastName}`.trim() || 'New employee',
        employeeCode: body.employeeCode ?? `WIT-${nextId + 1}`,
        status: 'Active',
        statusCode: 'ACTIVE',
        statusColor: 'green',
        hasPhoto: false,
        hasLogin: false,
        isActiveEmployment: true,
        company: 'World Infotek Solutions',
        branch: 'Head office',
        ...body,
      }),
    };
  }
  if (method === 'post' && parts.length === 1) return { data: save(collection, body) };
  if ((method === 'put' || method === 'patch') && parts.length === 2) return { data: save(collection, body, Number(parts[1])) };
  if (method === 'delete' && parts.length === 2) {
    remove(collection, Number(parts[1]));
    return { data: null };
  }
  if (method === 'post') return { data: null, message: 'Saved in this browser only.' };
  return { data: null };
}

/** Axios adapter used while demo mode is on. No request leaves the browser. */
export function demoAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  const path = (config.url ?? '').split('?')[0];
  if (config.responseType === 'blob') {
    const file = new Blob(['SAMPLE FILE - not a live export\n'], { type: 'text/plain' });
    return Promise.resolve({
      data: file,
      status: 200,
      statusText: 'OK',
      headers: { 'content-disposition': 'attachment; filename="sample.txt"' },
      config,
    });
  }
  const payload = answer((config.method ?? 'get').toLowerCase(), path, paramsOf(config), bodyOf(config.data));
  return Promise.resolve({
    data: { success: true, data: payload.data, message: payload.message ?? null, meta: payload.meta ?? null, errors: null, traceId: null },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  });
}
