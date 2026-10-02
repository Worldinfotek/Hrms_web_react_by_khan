import type { FormInstance } from 'antd';
import { ApiError } from '@/api/types';

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

/**
 * Shows server validation errors under the matching form fields.
 * Returns true when at least one field error was applied.
 */
export function applyFormErrors(form: FormInstance, error: unknown): boolean {
  if (!(error instanceof ApiError) || Object.keys(error.errors).length === 0) {
    return false;
  }

  const fieldNames = new Set(Object.keys(form.getFieldsValue(true) ?? {}));
  const fields = Object.entries(error.errors)
    .filter(([name]) => fieldNames.has(name))
    .map(([name, errors]) => ({ name, errors }));

  form.setFields(fields);
  return fields.length > 0;
}
