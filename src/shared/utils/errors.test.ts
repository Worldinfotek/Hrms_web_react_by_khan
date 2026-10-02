import { ApiError } from '@/api/types';
import { applyFormErrors, getErrorMessage } from './errors';

describe('errors', () => {
  it('returns the API message', () => {
    expect(getErrorMessage(new ApiError('This username is already in use.', 409))).toBe(
      'This username is already in use.',
    );
    expect(getErrorMessage('boom')).toBe('Something went wrong. Please try again.');
  });

  it('maps server validation errors onto existing form fields only', () => {
    const setFields = vi.fn();
    const form = { getFieldsValue: () => ({ userName: 'a', email: 'x' }), setFields };
    const error = new ApiError('Invalid', 400, { userName: ['Too short'], unknownField: ['ignored'] });

    const applied = applyFormErrors(form as never, error);

    expect(applied).toBe(true);
    expect(setFields).toHaveBeenCalledWith([{ name: 'userName', errors: ['Too short'] }]);
  });
});
