import { Alert, Button, Flex } from 'antd';
import { useProbationStore } from '../store';

export function SampleDataNotice() {
  const restoreSamples = useProbationStore((state) => state.restoreSamples);
  return (
    <Alert
      type="info"
      showIcon
      style={{ marginBottom: 16 }}
      title="Sample probation decisions stay in this browser. They do not update the employee record on the server."
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
