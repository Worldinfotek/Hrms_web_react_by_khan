import { Card, Col, Row, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { filterGroups, settingsGroups } from '@/app/router/navConfig';
import { useNavRole } from '@/app/router/useNavRole';
import { PageHeader } from '@/shared/components';
import { brandColors } from '@/theme/themeConfig';

/** Settings landing. Cards replace the secondary menu so the grid uses the full width. */
export default function SettingsHomePage() {
  const role = useNavRole();
  const groups = useMemo(() => filterGroups(settingsGroups, role), [role]);

  return (
    <>
      <PageHeader title="Settings" subtitle="Organization, access, time, pay, documents, and notifications." />
      <Row gutter={[16, 16]}>
        {groups.map((group) => (
          <Col key={group.key} xs={24} md={12} lg={8}>
            <Card title={group.label} styles={{ body: { padding: 16 } }} style={{ height: '100%' }}>
              {group.description && (
                <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
                  {group.description}
                </Typography.Paragraph>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {group.items.map((item) =>
                  item.path ? (
                    <div key={item.key}>
                      <Link to={item.path} style={{ color: brandColors.primary }}>
                        {item.label}
                      </Link>
                      {item.comingNext && (
                        <Tag color="blue" style={{ marginInlineStart: 8, marginInlineEnd: 0 }}>
                          Coming next
                        </Tag>
                      )}
                    </div>
                  ) : null,
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}
