import { Alert, Button, Flex } from 'antd';
import { useLeaveStore } from '../store';

export function SampleDataNotice() {
  const restoreSamples = useLeaveStore((state) => state.restoreSamples);
  return (
    <Alert
      type="info"
      showIcon
      style={{ marginBottom: 16 }}
      title="Sample leave stays in this browser only. It is not saved on the server."
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
