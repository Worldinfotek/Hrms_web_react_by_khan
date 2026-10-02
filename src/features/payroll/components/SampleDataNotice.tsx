import { Alert, Button, Flex } from 'antd';
import { usePayrollStore } from '../store';

export function SampleDataNotice() {
  const restoreSamples = usePayrollStore((state) => state.restoreSamples);
  return (
    <Alert
      type="info"
      showIcon
      style={{ marginBottom: 16 }}
      title="Sample payroll stays in this browser. The bank sheet is a sample file, not a live transfer."
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
