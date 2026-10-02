import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  LoginOutlined,
  LogoutOutlined,
  RiseOutlined,
  SwapOutlined,
  TagOutlined,
  UserSwitchOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { Empty, Flex, Skeleton, Tag, Timeline, Typography } from 'antd';
import type { ReactNode } from 'react';
import { formatDate, formatDateTime } from '@/shared/utils/format';
import { useOffboardingStore } from '@/features/offboarding/store';
import { isExited } from '@/features/offboarding/types';
import { useOnboardingStore } from '@/features/onboarding/store';
import { progressPercent } from '@/features/onboarding/types';
import { useProbationStore } from '@/features/probation/store';
import { useEmployeeTimeline } from '../api/employeesApi';
import type { EmploymentEventType } from '../types';

const EVENTS: Record<EmploymentEventType, { label: string; color: string; icon: ReactNode }> = {
  Joined: { label: 'Joined', color: 'green', icon: <LoginOutlined /> },
  Transferred: { label: 'Transfer', color: 'blue', icon: <SwapOutlined /> },
  Promoted: { label: 'Designation change', color: 'purple', icon: <RiseOutlined /> },
  ManagerChanged: { label: 'Manager change', color: 'cyan', icon: <UserSwitchOutlined /> },
  StatusChanged: { label: 'Status change', color: 'orange', icon: <TagOutlined /> },
  Confirmed: { label: 'Confirmed', color: 'green', icon: <CheckCircleOutlined /> },
  Exited: { label: 'Exit', color: 'red', icon: <LogoutOutlined /> },
  SalaryRevised: { label: 'Salary revision', color: 'gold', icon: <DollarOutlined /> },
};

/** Employment history, newest first. */
export function EmployeeTimeline({ employeeId, employeeCode }: { employeeId: number; employeeCode: string }) {
  const timeline = useEmployeeTimeline(employeeId);
  const joiners = useOnboardingStore((state) => state.joiners);
  const probation = useProbationStore((state) => state.cases);
  const exits = useOffboardingStore((state) => state.cases);
  const completed = joiners.find((joiner) => joiner.employeeCode === employeeCode && progressPercent(joiner) === 100);
  const confirmed = probation.find((item) => item.employeeCode === employeeCode && item.outcome === 'Confirmed' && item.confirmationDate);
  const exited = exits.find((item) => item.employeeCode === employeeCode && isExited(item));
  if (timeline.isLoading) return <Skeleton active />;
  if (!timeline.data?.length && !completed && !confirmed && !exited) return <Empty description="No history yet" />;

  const items = [
    ...(exited
      ? [
          {
            color: 'red',
            icon: <LogoutOutlined />,
            content: (
              <Flex vertical gap={2} style={{ paddingBottom: 8 }}>
                <Flex gap={8} align="center" wrap>
                  <Typography.Text strong>{formatDate(exited.lastWorkingDay)}</Typography.Text>
                  <Tag color="red" style={{ marginInlineEnd: 0 }}>
                    Exit
                  </Tag>
                </Flex>
                <Typography.Text>Exit completed in the sample</Typography.Text>
                <Typography.Text type="secondary" italic>
                  <ArrowRightOutlined style={{ fontSize: 10 }} /> The directory record is unchanged.
                </Typography.Text>
              </Flex>
            ),
          },
        ]
      : []),
    ...(confirmed
      ? [
          {
            color: 'green',
            icon: <CheckCircleOutlined />,
            content: (
              <Flex vertical gap={2} style={{ paddingBottom: 8 }}>
                <Flex gap={8} align="center" wrap>
                  <Typography.Text strong>{formatDate(confirmed.confirmationDate)}</Typography.Text>
                  <Tag color="green" style={{ marginInlineEnd: 0 }}>
                    Confirmation
                  </Tag>
                </Flex>
                <Typography.Text>Confirmed in the sample probation review</Typography.Text>
              </Flex>
            ),
          },
        ]
      : []),
    ...(completed
      ? [
          {
            color: 'green',
            icon: <CheckCircleOutlined />,
            content: (
              <Flex vertical gap={2} style={{ paddingBottom: 8 }}>
                <Flex gap={8} align="center" wrap>
                  <Typography.Text strong>{formatDate(completed.startDate)}</Typography.Text>
                  <Tag color="green" style={{ marginInlineEnd: 0 }}>
                    Onboarding
                  </Tag>
                </Flex>
                <Typography.Text>Onboarding completed</Typography.Text>
                <Typography.Text type="secondary" italic>
                  <ArrowRightOutlined style={{ fontSize: 10 }} /> All tasks in the sample plan are closed.
                </Typography.Text>
              </Flex>
            ),
          },
        ]
      : []),
    ...(timeline.data ?? []).map((entry) => {
        const meta = EVENTS[entry.eventType] ?? EVENTS.StatusChanged;
        return {
          color: meta.color,
          icon: meta.icon,
          content: (
            <Flex vertical gap={2} style={{ paddingBottom: 8 }}>
              <Flex gap={8} align="center" wrap>
                <Typography.Text strong>{formatDate(entry.effectiveDate)}</Typography.Text>
                <Tag color={meta.color} style={{ marginInlineEnd: 0 }}>
                  {meta.label}
                </Tag>
              </Flex>
              <Typography.Text>{entry.summary}</Typography.Text>
              {entry.remarks && (
                <Typography.Text type="secondary" italic>
                  <ArrowRightOutlined style={{ fontSize: 10 }} /> {entry.remarks}
                </Typography.Text>
              )}
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Recorded by {entry.recordedBy ?? 'system'} on {formatDateTime(entry.recordedAt)}
              </Typography.Text>
            </Flex>
          ),
        };
      }),
  ];

  return <Timeline items={items} />;
}
