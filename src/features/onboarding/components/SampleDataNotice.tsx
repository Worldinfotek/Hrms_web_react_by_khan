import { Alert, Button, Flex } from 'antd';
import { useOnboardingStore } from '../store';

export function SampleDataNotice() {
  const restoreSamples = useOnboardingStore((state) => state.restoreSamples);
  return (
    <Alert
      type="info"
      showIcon
      style={{ marginBottom: 16 }}
      title="Sample onboarding stays in this browser only. It does not change the employee record."
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
