import type { FormRule } from 'antd';

/** Same policy as the API: 8–128 chars with upper, lower, digit and symbol. */
export const passwordRules: FormRule[] = [
  { required: true, message: 'Password is required.' },
  { min: 8, message: 'At least 8 characters.' },
  { max: 128, message: 'At most 128 characters.' },
  { pattern: /[A-Z]/, message: 'Must contain an upper-case letter.' },
  { pattern: /[a-z]/, message: 'Must contain a lower-case letter.' },
  { pattern: /[0-9]/, message: 'Must contain a digit.' },
  { pattern: /[^a-zA-Z0-9]/, message: 'Must contain a symbol (e.g. ! @ # $).' },
];

export const confirmPasswordRule =
  (field: string): FormRule =>
  ({ getFieldValue }) => ({
    validator(_, value) {
      return !value || getFieldValue(field) === value
        ? Promise.resolve()
        : Promise.reject(new Error('The passwords do not match.'));
    },
  });
