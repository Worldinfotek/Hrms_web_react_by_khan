import { MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Card, Flex, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import type { EmployeeListItem } from '../types';
import { EmployeeAvatar } from './EmployeeAvatar';

/** Directory card. */
export function EmployeeCard({ employee }: { employee: EmployeeListItem }) {
  return (
    <Link to={`/employees/${employee.id}`} aria-label={`Open ${employee.fullName}`}>
      <Card hoverable size="small" styles={{ body: { padding: 16 } }} style={{ height: '100%' }}>
        <Flex vertical align="center" gap={6} style={{ textAlign: 'center' }}>
          <EmployeeAvatar id={employee.id} name={employee.fullName} hasPhoto={employee.hasPhoto} size={64} />
          <Typography.Text strong ellipsis style={{ maxWidth: '100%' }}>
            {employee.fullName}
          </Typography.Text>
          <Typography.Text type="secondary" ellipsis style={{ maxWidth: '100%', fontSize: 13 }}>
            {employee.designation}
          </Typography.Text>
          <Flex gap={4} wrap justify="center">
            <Tag variant="filled" style={{ marginInlineEnd: 0 }}>
              {employee.employeeCode}
            </Tag>
            <Tag color={employee.statusColor} style={{ marginInlineEnd: 0 }}>
              {employee.status}
            </Tag>
          </Flex>
          <Typography.Text type="secondary" style={{ fontSize: 12 }} ellipsis>
            {employee.department} · {employee.branch}
          </Typography.Text>
          <Flex vertical gap={2} style={{ fontSize: 12, maxWidth: '100%' }}>
            {employee.workEmail && (
              <Typography.Text type="secondary" ellipsis style={{ fontSize: 12 }}>
                <MailOutlined /> {employee.workEmail}
              </Typography.Text>
            )}
            {employee.mobilePhone && (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                <PhoneOutlined /> {employee.mobilePhone}
              </Typography.Text>
            )}
          </Flex>
        </Flex>
      </Card>
    </Link>
  );
}
