import { Alert, Button, Flex } from 'antd';
import { useOffboardingStore } from '../store';

export function SampleDataNotice() {
  const restoreSamples = useOffboardingStore((state) => state.restoreSamples);
  return (
    <Alert
      type="info"
      showIcon
      style={{ marginBottom: 16 }}
      title="Exit records stay in this browser. The employee directory on the server is not updated."
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
