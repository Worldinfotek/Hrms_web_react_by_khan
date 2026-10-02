import { Card, List } from 'antd';
import { PageHeader } from '@/shared/components';
import { formatDate } from '@/shared/utils/format';
import { EmployeeViewGate } from '../components/EmployeeViewGate';
import { useEssStore } from '../store';

export default function EssAnnouncementsPage() {
  const announcements = useEssStore((state) => state.announcements);
  return (
    <>
      <PageHeader title="Announcements" />
      <EmployeeViewGate>
        <Card styles={{ body: { padding: 16 } }}>
          <List
            dataSource={announcements}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta title={item.title} description={`${formatDate(item.date)} — ${item.body}`} />
              </List.Item>
            )}
          />
        </Card>
      </EmployeeViewGate>
    </>
  );
}
