import { Alert, Button, Flex, Switch } from 'antd';
import type { ReactNode } from 'react';
import { ESS_EMPLOYEE } from '../types';
import { useEssStore } from '../store';

export function EmployeeViewGate({ children }: { children: ReactNode }) {
  const viewAsEmployee = useEssStore((state) => state.viewAsEmployee);
  const setViewAsEmployee = useEssStore((state) => state.setViewAsEmployee);
  const restoreSamples = useEssStore((state) => state.restoreSamples);
  return (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        title={`View as employee shows ${ESS_EMPLOYEE.name} only. It does not replace your admin login, and it does not show anyone else’s salary.`}
        action={
          <Flex gap={8} align="center">
            <Switch checked={viewAsEmployee} onChange={setViewAsEmployee} />
            <span>View as employee</span>
            <Button size="small" onClick={() => restoreSamples()}>
              Restore samples
            </Button>
          </Flex>
        }
      />
      {viewAsEmployee ? children : <Alert type="warning" showIcon title="Turn on View as employee to open Hira Shah’s self-service." />}
    </>
  );
}
