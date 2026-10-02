import { Flex, Select, Typography } from 'antd';
import type { SelectProps } from 'antd';
import { useDeferredValue, useState } from 'react';
import { useEmployeeLookup } from '../api/employeesApi';
import { EmployeeAvatar } from './EmployeeAvatar';

interface EmployeeSelectProps extends Omit<SelectProps<number>, 'options' | 'onSearch' | 'showSearch'> {
  /** Hide this employee (e.g. the employee themself when picking a manager). */
  excludeId?: number;
  /** Label for the current value when it is not in the search results yet. */
  initialLabel?: string | null;
}

/** Searchable picker of current employees (name, code or e-mail). */
export function EmployeeSelect({ excludeId, initialLabel, value, ...rest }: EmployeeSelectProps) {
  const [search, setSearch] = useState('');
  const deferred = useDeferredValue(search);
  const lookup = useEmployeeLookup(deferred, excludeId);

  const options = (lookup.data ?? []).map((e) => ({
    value: e.id,
    searchText: `${e.fullName} ${e.employeeCode}`,
    label: (
      <Flex gap={8} align="center">
        <EmployeeAvatar id={e.id} name={e.fullName} hasPhoto={e.hasPhoto} size={22} />
        <span>
          {e.fullName}{' '}
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            · {e.employeeCode} · {e.designation}
          </Typography.Text>
        </span>
      </Flex>
    ),
  }));

  if (value && initialLabel && !options.some((o) => o.value === value)) {
    options.unshift({ value, searchText: initialLabel, label: <span>{initialLabel}</span> });
  }

  return (
    <Select<number>
      {...rest}
      value={value}
      showSearch={{ filterOption: false, onSearch: setSearch }}
      loading={lookup.isFetching}
      options={options}
      notFoundContent={lookup.isFetching ? 'Searching…' : 'No employee found'}
      optionLabelProp="label"
    />
  );
}
