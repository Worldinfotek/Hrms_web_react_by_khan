import { Alert, Button, Flex } from 'antd';
import { useNotificationStore } from '../store';

export function SampleDataNotice() {
  const restoreSamples = useNotificationStore((state) => state.restoreSamples);
  return (
    <Alert
      type="info"
      showIcon
      style={{ marginBottom: 16 }}
      title="Alerts stay in this browser. Nothing is emailed or sent by SMS."
      action={
        <Flex>
          <Button size="small" onClick={() => restoreSamples()}>
            Restore samples
          </Button>
        </Flex>
      }
    />
  );
}
