import { Alert, Button, Flex } from 'antd';
import { useDocumentStore } from '../store';

/** Shown on every Phase 1 screen so reviewers know this data is not on the server. */
export function SampleDataNotice() {
  const restoreSamples = useDocumentStore((state) => state.restoreSamples);
  return (
    <Alert
      type="info"
      showIcon
      style={{ marginBottom: 16 }}
      title="Sample documents stay in this browser only. They are not saved on the server."
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
