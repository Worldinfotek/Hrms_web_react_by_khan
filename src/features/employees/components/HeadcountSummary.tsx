import {
  CalendarOutlined,
  LoginOutlined,
  LogoutOutlined,
  TeamOutlined,
  HourglassOutlined,
} from '@ant-design/icons';
import { Card, Col, Empty, Flex, Row, Skeleton, Tag, Tooltip, Typography, theme } from 'antd';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployeeSummary } from '../api/employeesApi';

function Tile({
  icon,
  label,
  value,
  hint,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  hint?: string;
  onClick?: () => void;
}) {
  return (
    <Card size="small" hoverable={!!onClick} onClick={onClick} style={{ height: '100%' }}>
      <Flex vertical gap={2}>
        <Typography.Text type="secondary">
          {icon} {label}
        </Typography.Text>
        <Typography.Text style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.2 }}>{value}</Typography.Text>
        {hint && (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {hint}
          </Typography.Text>
        )}
      </Flex>
    </Card>
  );
}

/** Headcount for the dashboard (respects the user's data scope). */
export function HeadcountSummary() {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const summary = useEmployeeSummary();
  if (summary.isLoading) return <Skeleton active />;
  if (!summary.data) return null;
  const s = summary.data;
  const max = Math.max(1, ...s.byDepartment.map((d) => d.count));

  return (
    <Row gutter={[16, 16]}>
      <Col xs={12} md={8} xl={4}>
        <Tile
          icon={<TeamOutlined />}
          label="Active employees"
          value={s.activeEmployees}
          onClick={() => navigate('/employees')}
        />
      </Col>
      <Col xs={12} md={8} xl={5}>
        <Tile
          icon={<HourglassOutlined />}
          label="On probation"
          value={s.onProbation}
          hint={`${s.probationEndingIn30Days} ending in 30 days`}
        />
      </Col>
      <Col xs={12} md={8} xl={5}>
        <Tile icon={<LoginOutlined />} label="Joined this month" value={s.joinedThisMonth} />
      </Col>
      <Col xs={12} md={8} xl={5}>
        <Tile icon={<LogoutOutlined />} label="Left this month" value={s.leftThisMonth} />
      </Col>
      <Col xs={24} md={16} xl={5}>
        <Card size="small" style={{ height: '100%' }}>
          <Typography.Text type="secondary">
            <CalendarOutlined /> By status
          </Typography.Text>
          <Flex wrap gap={6} style={{ marginTop: 8 }}>
            {s.byStatus.map((st) => (
              <Tag key={st.name} color={st.color ?? undefined} style={{ marginInlineEnd: 0 }}>
                {st.name}: {st.count}
              </Tag>
            ))}
          </Flex>
        </Card>
      </Col>
      <Col xs={24}>
        <Card size="small" title="Active employees by department">
          {s.byDepartment.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No employees yet" />
          ) : (
            <Flex vertical gap={8} role="list" aria-label="Active employees by department">
              {s.byDepartment.map((d) => (
                <Flex key={d.name} align="center" gap={12} role="listitem">
                  <Typography.Text ellipsis style={{ width: 180, flexShrink: 0 }}>
                    {d.name}
                  </Typography.Text>
                  <Tooltip title={`${d.name}: ${d.count}`}>
                    <div style={{ flex: 1, height: 14, display: 'flex', alignItems: 'center' }}>
                      <div
                        style={{
                          width: `${(d.count / max) * 100}%`,
                          minWidth: 4,
                          height: 10,
                          background: token.colorPrimary,
                          borderRadius: '0 4px 4px 0',
                        }}
                      />
                    </div>
                  </Tooltip>
                  <Typography.Text style={{ width: 36, textAlign: 'right' }}>{d.count}</Typography.Text>
                </Flex>
              ))}
            </Flex>
          )}
        </Card>
      </Col>
    </Row>
  );
}
