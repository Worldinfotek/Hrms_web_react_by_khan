import { Alert, Button, Flex } from 'antd';
import { useRecruitmentStore } from '../store';

export function SampleDataNotice() {
  const restoreSamples = useRecruitmentStore((state) => state.restoreSamples);
  return (
    <Alert
      type="info"
      showIcon
      style={{ marginBottom: 16 }}
      title="Sample recruitment stays in this browser only. Converting a candidate does not create an employee."
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
