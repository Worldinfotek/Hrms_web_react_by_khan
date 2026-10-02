import { Alert, Flex, Switch } from 'antd';
import type { ReactNode } from 'react';
import { MANAGER } from '../team';
import { useManagerStore } from '../store';

export function ManagerViewGate({ children }: { children: ReactNode }) {
  const viewAsManager = useManagerStore((state) => state.viewAsManager);
  const setViewAsManager = useManagerStore((state) => state.setViewAsManager);
  return (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        title={`View as manager shows ${MANAGER.name}’s team. It does not replace your admin login.`}
        action={
          <Flex gap={8} align="center">
            <Switch checked={viewAsManager} onChange={setViewAsManager} />
            <span>View as manager</span>
          </Flex>
        }
      />
      {viewAsManager ? children : <Alert type="warning" showIcon title="Turn on View as manager to open Usman Khan’s team." />}
    </>
  );
}
