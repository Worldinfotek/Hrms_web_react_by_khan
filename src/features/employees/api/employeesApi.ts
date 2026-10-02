import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, httpClient } from '@/api/httpClient';
import type { CreateUserResponse } from '@/features/users/types';
import type {
  CustomFieldDefinition,
  EmployeeActionKind,
  EmployeeDetail,
  EmployeeListItem,
  EmployeeListQuery,
  EmployeeLookup,
  EmployeeRequest,
  EmployeeSummary,
  ImportReport,
  StatusOption,
  TimelineEntry,
} from '../types';

export const employeeKeys = {
  all: ['employees'] as const,
  list: (query: EmployeeListQuery) => ['employees', 'list', query] as const,
  detail: (id: number) => ['employees', 'detail', id] as const,
  timeline: (id: number) => ['employees', 'timeline', id] as const,
  photo: (id: number) => ['employees', 'photo', id] as const,
  lookup: (search: string, excludeId?: number) => ['employees', 'lookup', search, excludeId ?? 0] as const,
  summary: ['employees', 'summary'] as const,
  allowedStatuses: (id: number) => ['employees', 'allowed-statuses', id] as const,
  initialStatuses: ['employees', 'initial-statuses'] as const,
  customFields: ['custom-fields', 'active'] as const,
};

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

function fileForm(file: File | Blob, name = 'file') {
  const form = new FormData();
  form.append(name, file);
  return form;
}

/** Downloads a file endpoint and triggers the browser's save dialog. */
export async function downloadFile(url: string, params?: object, fallbackName = 'download') {
  const response = await httpClient.get<Blob>(url, { params, responseType: 'blob' });
  const disposition = String(response.headers['content-disposition'] ?? '');
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  const fileName = match ? decodeURIComponent(match[1]) : fallbackName;
  const href = URL.createObjectURL(response.data);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(href);
  return fileName;
}

export const employeesApi = {
  list: (query: EmployeeListQuery) => api.getPaged<EmployeeListItem>('/employees', query),
  get: (id: number) => api.get<EmployeeDetail>(`/employees/${id}`),
  create: (body: EmployeeRequest) => api.post<EmployeeDetail>('/employees', body),
  update: (id: number, body: EmployeeRequest) => api.put<EmployeeDetail>(`/employees/${id}`, body),
  remove: (id: number) => api.delete(`/employees/${id}`),
  timeline: (id: number) => api.get<TimelineEntry[]>(`/employees/${id}/timeline`),
  lookup: (search: string, excludeId?: number) =>
    api.get<EmployeeLookup[]>('/employees/lookup', { params: { search, excludeId, take: 20 } }),
  summary: () => api.get<EmployeeSummary>('/employees/summary'),
  action: (id: number, kind: EmployeeActionKind, body: object) =>
    api.post<EmployeeDetail>(`/employees/${id}/actions/${kind}`, body),
  allowedStatuses: (id: number) => api.get<StatusOption[]>(`/employees/${id}/allowed-statuses`),
  initialStatuses: () => api.get<StatusOption[]>('/employees/initial-statuses'),
  /** Photo as a data URL: nothing to revoke, so it is safe to cache and share between components. */
  photo: async (id: number) => {
    const blob = (await httpClient.get<Blob>(`/employees/${id}/photo`, { responseType: 'blob' })).data;
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error ?? new Error('Could not read the photo.'));
      reader.readAsDataURL(blob);
    });
  },
  uploadPhoto: (id: number, file: File) =>
    api.post<null>(`/employees/${id}/photo`, fileForm(file), multipart),
  removePhoto: (id: number) => api.delete(`/employees/${id}/photo`),
  createUser: (id: number, body: { userName: string; email?: string | null; roleIds: number[] }) =>
    api.post<CreateUserResponse>(`/employees/${id}/create-user`, body),
  validateImport: (file: File) =>
    api.post<ImportReport>('/employees/import/validate', fileForm(file), multipart),
  runImport: (file: File, skipInvalid: boolean) =>
    api.post<ImportReport>(`/employees/import?skipInvalid=${skipInvalid}`, fileForm(file), multipart),
  activeCustomFields: () => api.get<CustomFieldDefinition[]>('/custom-fields/active'),
};

export function useEmployees(query: EmployeeListQuery) {
  return useQuery({
    queryKey: employeeKeys.list(query),
    queryFn: () => employeesApi.list(query),
    placeholderData: keepPreviousData,
  });
}

export function useEmployee(id: number | undefined) {
  return useQuery({
    queryKey: employeeKeys.detail(id ?? 0),
    queryFn: () => employeesApi.get(id!),
    enabled: !!id,
  });
}

export function useEmployeeTimeline(id: number | undefined) {
  return useQuery({
    queryKey: employeeKeys.timeline(id ?? 0),
    queryFn: () => employeesApi.timeline(id!),
    enabled: !!id,
  });
}

export function useEmployeePhoto(id: number | undefined, hasPhoto: boolean) {
  return useQuery({
    queryKey: employeeKeys.photo(id ?? 0),
    queryFn: () => employeesApi.photo(id!),
    enabled: !!id && hasPhoto,
    staleTime: 10 * 60_000,
    retry: false,
  });
}

export function useEmployeeLookup(search: string, excludeId?: number, enabled = true) {
  return useQuery({
    queryKey: employeeKeys.lookup(search, excludeId),
    queryFn: () => employeesApi.lookup(search, excludeId),
    enabled,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

export function useEmployeeSummary(enabled = true) {
  return useQuery({ queryKey: employeeKeys.summary, queryFn: employeesApi.summary, enabled });
}

export function useAllowedStatuses(id: number | undefined, enabled: boolean) {
  return useQuery({
    queryKey: employeeKeys.allowedStatuses(id ?? 0),
    queryFn: () => employeesApi.allowedStatuses(id!),
    enabled: !!id && enabled,
  });
}

export function useInitialStatuses(enabled = true) {
  return useQuery({
    queryKey: employeeKeys.initialStatuses,
    queryFn: employeesApi.initialStatuses,
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useActiveCustomFields() {
  return useQuery({
    queryKey: employeeKeys.customFields,
    queryFn: employeesApi.activeCustomFields,
    staleTime: 5 * 60_000,
  });
}

/** Any change to employees refreshes lists, details and the dropdown cache. */
function useEmployeeMutation<TVariables, TResult>(fn: (variables: TVariables) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      await queryClient.invalidateQueries({ queryKey: ['departments'] });
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export const useCreateEmployee = () => useEmployeeMutation(employeesApi.create);
export const useUpdateEmployee = () =>
  useEmployeeMutation(({ id, body }: { id: number; body: EmployeeRequest }) => employeesApi.update(id, body));
export const useDeleteEmployee = () => useEmployeeMutation(employeesApi.remove);
export const useEmployeeAction = () =>
  useEmployeeMutation(({ id, kind, body }: { id: number; kind: EmployeeActionKind; body: object }) =>
    employeesApi.action(id, kind, body),
  );
export const useUploadPhoto = () =>
  useEmployeeMutation(({ id, file }: { id: number; file: File }) => employeesApi.uploadPhoto(id, file));
export function useRemovePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: employeesApi.removePhoto,
    onSuccess: async (_data, id) => {
      // Drop the cached image first so it is not re-fetched (it no longer exists).
      queryClient.removeQueries({ queryKey: employeeKeys.photo(id) });
      await queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}
export const useCreateEmployeeUser = () =>
  useEmployeeMutation(
    ({ id, body }: { id: number; body: { userName: string; email?: string | null; roleIds: number[] } }) =>
      employeesApi.createUser(id, body),
  );
export const useRunImport = () =>
  useEmployeeMutation(({ file, skipInvalid }: { file: File; skipInvalid: boolean }) =>
    employeesApi.runImport(file, skipInvalid),
  );
