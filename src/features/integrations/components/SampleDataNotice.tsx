import { Alert, Button, Flex } from 'antd';
import { useIntegrationStore } from '../store';

export function SampleDataNotice() {
  const restoreSamples = useIntegrationStore((state) => state.restoreSamples);
  return (
    <Alert
      type="info"
      showIcon
      style={{ marginBottom: 16 }}
      title="No live calls. Keys are masked samples, and the device punch only updates attendance in this browser."
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
