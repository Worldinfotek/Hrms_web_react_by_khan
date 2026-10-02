import { BellOutlined } from '@ant-design/icons';
import { Badge, Button, Drawer, List, Tag, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '@/shared/utils/format';
import { useNotificationStore } from '../store';

export function NotificationBell() {
  const notifications = useNotificationStore((state) => state.notifications);
  const markRead = useNotificationStore((state) => state.markRead);
  const [open, setOpen] = useState(false);
  const unread = useMemo(() => notifications.filter((item) => !item.read), [notifications]);

  return (
    <>
      <Badge count={unread.length} size="small">
        <Button type="text" aria-label="Alerts" icon={<BellOutlined />} onClick={() => setOpen(true)} />
      </Badge>
      <Drawer
        open={open}
        title="Alerts"
        onClose={() => setOpen(false)}
        size={420}
        extra={
          <Link to="/notifications" onClick={() => setOpen(false)}>
            View all alerts
          </Link>
        }
      >
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              actions={
                item.read
                  ? [<Tag key="read">Read</Tag>]
                  : [
                      <Button key="read" type="link" onClick={() => markRead(item.id)}>
                        Mark read
                      </Button>,
                    ]
              }
            >
              <List.Item.Meta
                title={item.title}
                description={
                  <>
                    <div>{item.body}</div>
                    <Typography.Text type="secondary">
                      {formatDate(item.date)} · {item.delivery}
                    </Typography.Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Drawer>
    </>
  );
}
