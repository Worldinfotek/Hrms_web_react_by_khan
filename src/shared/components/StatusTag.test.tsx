import { render, screen } from '@testing-library/react';
import { getStatusColor } from '@/shared/utils/status';
import { StatusTag } from './StatusTag';

describe('StatusTag', () => {
  it('maps known statuses to consistent colours (case-insensitive)', () => {
    expect(getStatusColor('Active')).toBe('green');
    expect(getStatusColor('REJECTED')).toBe('red');
    expect(getStatusColor(' notice period ')).toBe('orange');
  });

  it('falls back to default for unknown statuses', () => {
    expect(getStatusColor('Something new')).toBe('default');
  });

  it('renders the status text', () => {
    render(<StatusTag status="Probation" />);
    expect(screen.getByText('Probation')).toBeInTheDocument();
  });
});
