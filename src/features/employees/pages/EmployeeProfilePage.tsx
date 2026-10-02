import {
  ArrowLeftOutlined,
  CameraOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  KeyOutlined,
  MailOutlined,
  PhoneOutlined,
  RiseOutlined,
  SwapOutlined,
  TagOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import {
  App,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Dropdown,
  Empty,
  Flex,
  Result,
  Row,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from 'antd';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { EmployeeAttendanceTab } from '@/features/attendance/components/EmployeeAttendanceTab';
import { EmployeeLeaveTab } from '@/features/leave/components/EmployeeLeaveTab';
import { EmployeeSalaryTab } from '@/features/payroll/components/EmployeeSalaryTab';
import { ExitStatusTag } from '@/features/offboarding/components/ExitStatusTag';
import { ProbationProfileNote } from '@/features/probation/components/ProbationProfileNote';
import { EmployeeDocumentsTab } from '@/features/documents/components/EmployeeDocumentsTab';
import { PageLoader } from '@/shared/components';
import { Permissions } from '@/shared/auth/permissions';
import { usePermission } from '@/shared/auth/usePermission';
import { getErrorMessage } from '@/shared/utils/errors';
import { formatDate, formatDateTime } from '@/shared/utils/format';
import { useDeleteEmployee, useEmployee, useRemovePhoto, useUploadPhoto } from '../api/employeesApi';
import { CreateLoginModal } from '../components/CreateLoginModal';
import { EmployeeActionModal } from '../components/EmployeeActionModal';
import { EmployeeAvatar } from '../components/EmployeeAvatar';
import { EmployeeTimeline } from '../components/EmployeeTimeline';
import type { Address, EmployeeActionKind, EmployeeDetail } from '../types';

const MAX_PHOTO = 2 * 1024 * 1024;

function tenure(joiningDate: string, exitDate: string | null) {
  const end = exitDate ? dayjs(exitDate) : dayjs();
  const months = end.diff(dayjs(joiningDate), 'month');
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (months < 1) return 'less than a month';
  return [years ? `${years} yr` : '', rest ? `${rest} mo` : ''].filter(Boolean).join(' ');
}

const addressText = (a: Address | null) =>
  a ? [a.addressLine, a.cityName, a.countryName, a.postalCode].filter(Boolean).join(', ') || '—' : '—';

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const employeeId = Number(id);
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const employee = useEmployee(employeeId);
  const canEdit = usePermission(Permissions.Employees.Edit);
  const canDelete = usePermission(Permissions.Employees.Delete);
  const canAct = usePermission(Permissions.Employees.ManageActions);
  const canCreateUser = usePermission(Permissions.Users.Create);
  const canViewUsers = usePermission(Permissions.Users.View);
  const upload = useUploadPhoto();
  const removePhoto = useRemovePhoto();
  const remove = useDeleteEmployee();
  const [action, setAction] = useState<EmployeeActionKind | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'overview';
  const setTab = (key: string) => {
    if (key === tab) return;
    setParams(key === 'overview' ? {} : { tab: key }, { replace: true });
  };

  if (employee.isLoading) return <PageLoader />;
  if (!employee.data) {
    return (
      <Result
        status="404"
        title="Employee not found"
        subTitle="The employee does not exist or is outside your data scope."
        extra={<Button onClick={() => navigate('/employees')}>Back to employees</Button>}
      />
    );
  }

  const e = employee.data;

  const actionItems: MenuProps['items'] = [
    { key: 'transfer', icon: <SwapOutlined />, label: 'Transfer', disabled: !e.isActiveEmployment },
    {
      key: 'promote',
      icon: <RiseOutlined />,
      label: 'Promote / change designation',
      disabled: !e.isActiveEmployment,
    },
    {
      key: 'change-manager',
      icon: <UserSwitchOutlined />,
      label: 'Change reporting manager',
      disabled: !e.isActiveEmployment,
    },
    { key: 'change-status', icon: <TagOutlined />, label: 'Change status' },
  ];

  const onUpload = (file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > MAX_PHOTO) {
      message.error('Choose a JPG, PNG or WEBP image up to 2 MB.');
      return false;
    }
    upload.mutate(
      { id: e.id, file },
      {
        onSuccess: () => message.success('Photo updated.'),
        onError: (err) => message.error(getErrorMessage(err)),
      },
    );
    return false;
  };

  const confirmDelete = () =>
    modal.confirm({
      title: `Delete ${e.fullName}?`,
      content:
        'Only for records created by mistake. For people who left, use Change status → Exited instead.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: () =>
        remove.mutateAsync(e.id).then(
          () => {
            message.success('Employee deleted.');
            navigate('/employees');
          },
          (err) => message.error(getErrorMessage(err)),
        ),
    });

  return (
    <>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }} wrap gap={8}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/employees')}>
          Employees
        </Button>
        <Flex gap={8} wrap>
          {canAct && (
            <Dropdown
              menu={{ items: actionItems, onClick: ({ key }) => setAction(key as EmployeeActionKind) }}
            >
              <Button>
                Actions <DownOutlined />
              </Button>
            </Dropdown>
          )}
          {canEdit && canCreateUser && !e.userId && e.isActiveEmployment && (
            <Button icon={<KeyOutlined />} onClick={() => setLoginOpen(true)}>
              Create login
            </Button>
          )}
          {canEdit && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/employees/${e.id}/edit`)}
            >
              Edit
            </Button>
          )}
          {canDelete && (
            <Tooltip title="Delete (records created by mistake only)">
              <Button danger icon={<DeleteOutlined />} onClick={confirmDelete} aria-label="Delete employee" />
            </Tooltip>
          )}
        </Flex>
      </Flex>

      <Card style={{ marginBottom: 16 }}>
        <Flex gap={24} wrap align="center">
          <Flex vertical align="center" gap={8}>
            <Badge
              count={
                canEdit ? (
                  <Upload
                    accept="image/jpeg,image/png,image/webp"
                    showUploadList={false}
                    beforeUpload={onUpload}
                  >
                    <Button
                      shape="circle"
                      size="small"
                      icon={<CameraOutlined />}
                      loading={upload.isPending}
                      aria-label="Change photo"
                    />
                  </Upload>
                ) : null
              }
              offset={[-12, 84]}
            >
              <EmployeeAvatar id={e.id} name={e.fullName} hasPhoto={e.hasPhoto} size={96} />
            </Badge>
            {canEdit && e.hasPhoto && (
              <Button type="link" size="small" onClick={() => removePhoto.mutate(e.id)}>
                Remove photo
              </Button>
            )}
          </Flex>
          <Flex vertical gap={4} style={{ flex: 1, minWidth: 240 }}>
            <Flex gap={8} align="center" wrap>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {e.fullName}
              </Typography.Title>
              <ExitStatusTag employeeCode={e.employeeCode} status={e.status} color={e.statusColor} />
            </Flex>
            <Typography.Text style={{ fontSize: 16 }}>
              {e.designation}
              {e.grade ? ` (${e.grade})` : ''} · {e.department}
              {e.team ? ` / ${e.team}` : ''}
            </Typography.Text>
            <Flex gap={16} wrap>
              <Typography.Text type="secondary">
                <Tag variant="filled">{e.employeeCode}</Tag> {e.branch}
              </Typography.Text>
              {e.workEmail && (
                <Typography.Text type="secondary" copyable={{ text: e.workEmail }}>
                  <MailOutlined /> {e.workEmail}
                </Typography.Text>
              )}
              {e.mobilePhone && (
                <Typography.Text type="secondary">
                  <PhoneOutlined /> {e.mobilePhone}
                </Typography.Text>
              )}
            </Flex>
          </Flex>
          <Row gutter={[24, 8]} style={{ minWidth: 280 }}>
            <Col span={12}>
              <Typography.Text type="secondary">Joined</Typography.Text>
              <div>{formatDate(e.joiningDate)}</div>
            </Col>
            <Col span={12}>
              <Typography.Text type="secondary">Tenure</Typography.Text>
              <div>{tenure(e.joiningDate, e.exitDate)}</div>
            </Col>
            <Col span={12}>
              <Typography.Text type="secondary">Reports to</Typography.Text>
              <div>
                {e.reportingManagerId ? (
                  <Link to={`/employees/${e.reportingManagerId}`}>{e.reportingManager}</Link>
                ) : (
                  '—'
                )}
              </div>
            </Col>
            <Col span={12}>
              <Typography.Text type="secondary">Direct reports</Typography.Text>
              <div>{e.directReportCount}</div>
            </Col>
          </Row>
        </Flex>
      </Card>

      <Card styles={{ body: { paddingTop: 4 } }}>
        <Tabs
          activeKey={tab}
          onChange={setTab}
          items={[
            { key: 'overview', label: 'Overview', children: <Overview e={e} canViewUsers={canViewUsers} /> },
            { key: 'personal', label: 'Personal', children: <Personal e={e} /> },
            { key: 'employment', label: 'Employment', children: <Employment e={e} /> },
            {
              key: 'documents',
              label: 'Documents',
              children: <EmployeeDocumentsTab employeeCode={e.employeeCode} />,
            },
            {
              key: 'attendance',
              label: 'Attendance',
              children: <EmployeeAttendanceTab employeeCode={e.employeeCode} employeeName={e.fullName} />,
            },
            {
              key: 'leave',
              label: 'Leave',
              children: <EmployeeLeaveTab employeeCode={e.employeeCode} />,
            },
            {
              key: 'salary',
              label: 'Salary',
              children: <EmployeeSalaryTab employeeCode={e.employeeCode} />,
            },
            { key: 'timeline', label: 'Timeline', children: <EmployeeTimeline employeeId={e.id} employeeCode={e.employeeCode} /> },
          ]}
        />
      </Card>

      <EmployeeActionModal kind={action} employee={e} onClose={() => setAction(null)} />
      <CreateLoginModal open={loginOpen} employee={e} onClose={() => setLoginOpen(false)} />
    </>
  );
}

function Overview({ e, canViewUsers }: { e: EmployeeDetail; canViewUsers: boolean }) {
  const probationDue = e.statusCode === 'PROBATION' && e.probationEndDate;
  const primary = e.emergencyContacts.find((c) => c.isPrimary) ?? e.emergencyContacts[0];
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Descriptions title="Job" size="small" column={1} bordered>
          <Descriptions.Item label="Designation">{e.designation}</Descriptions.Item>
          <Descriptions.Item label="Department">{e.department}</Descriptions.Item>
          <Descriptions.Item label="Employment type">{e.employmentType}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={e.statusColor}>{e.status}</Tag>
            {probationDue && (
              <Typography.Text
                type={dayjs(e.probationEndDate).isBefore(dayjs().add(30, 'day')) ? 'warning' : 'secondary'}
              >
                probation ends {formatDate(e.probationEndDate)}
              </Typography.Text>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Col>
      <Col xs={24} lg={12}>
        <Descriptions title="Access & contacts" size="small" column={1} bordered>
          <Descriptions.Item label="Login account">
            {e.userId ? (
              <>
                {canViewUsers ? <Link to="/users">{e.userName}</Link> : e.userName}{' '}
                <Tag color={e.userIsActive ? 'green' : 'default'}>
                  {e.userIsActive ? 'Active' : 'Disabled'}
                </Tag>
              </>
            ) : (
              <Typography.Text type="secondary">No login yet</Typography.Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Emergency contact">
            {primary
              ? `${primary.name}${primary.relationship ? ` (${primary.relationship})` : ''} · ${primary.phone}`
              : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Last updated">
            {formatDateTime(e.updatedAt ?? e.createdAt)}
          </Descriptions.Item>
        </Descriptions>
      </Col>
    </Row>
  );
}

function Personal({ e }: { e: EmployeeDetail }) {
  return (
    <>
      <Descriptions size="small" bordered column={{ xs: 1, md: 2, xl: 3 }}>
        <Descriptions.Item label="Full name">{e.fullName}</Descriptions.Item>
        <Descriptions.Item label="Father's name">{e.fatherName ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="CNIC">{e.cnic ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="Date of birth">{formatDate(e.dateOfBirth)}</Descriptions.Item>
        <Descriptions.Item label="Gender">{e.gender ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="Marital status">{e.maritalStatus ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="Blood group">{e.bloodGroup ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="Nationality">{e.nationality ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="Personal e-mail">{e.personalEmail ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="Work phone">{e.workPhone ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="Current address" span={{ xs: 1, md: 2, xl: 3 }}>
          {addressText(e.currentAddress)}
        </Descriptions.Item>
        <Descriptions.Item label="Permanent address" span={{ xs: 1, md: 2, xl: 3 }}>
          {addressText(e.permanentAddress)}
        </Descriptions.Item>
      </Descriptions>
      <Typography.Title level={5} style={{ marginTop: 16 }}>
        Emergency contacts
      </Typography.Title>
      {e.emergencyContacts.length ? (
        <Row gutter={[12, 12]}>
          {e.emergencyContacts.map((c, i) => (
            <Col xs={24} md={12} xl={8} key={i}>
              <Card size="small">
                <Flex justify="space-between">
                  <Typography.Text strong>{c.name}</Typography.Text>
                  {c.isPrimary && <Tag color="blue">Primary</Tag>}
                </Flex>
                <div>{c.relationship ?? '—'}</div>
                <div>
                  <PhoneOutlined /> {c.phone}
                  {c.alternatePhone ? ` · ${c.alternatePhone}` : ''}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No emergency contacts" />
      )}
      {e.customFields.length > 0 && (
        <>
          <Typography.Title level={5} style={{ marginTop: 16 }}>
            Additional information
          </Typography.Title>
          <Descriptions size="small" bordered column={{ xs: 1, md: 2, xl: 3 }}>
            {e.customFields.map((f) => (
              <Descriptions.Item key={f.fieldId} label={f.name}>
                {f.fieldType === 'Boolean'
                  ? f.value === 'true'
                    ? 'Yes'
                    : 'No'
                  : f.fieldType === 'Date'
                    ? formatDate(f.value)
                    : (f.value ?? '—')}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </>
      )}
    </>
  );
}

function Employment({ e }: { e: EmployeeDetail }) {
  return (
    <>
      <ProbationProfileNote employeeCode={e.employeeCode} />
      <Descriptions size="small" bordered column={{ xs: 1, md: 2, xl: 3 }}>
      <Descriptions.Item label="Employee code">{e.employeeCode}</Descriptions.Item>
      <Descriptions.Item label="Company">{e.company}</Descriptions.Item>
      <Descriptions.Item label="Branch / location">{e.branch}</Descriptions.Item>
      <Descriptions.Item label="Department">{e.department}</Descriptions.Item>
      <Descriptions.Item label="Team">{e.team ?? '—'}</Descriptions.Item>
      <Descriptions.Item label="Designation">
        {e.designation}
        {e.grade ? ` (${e.grade})` : ''}
      </Descriptions.Item>
      <Descriptions.Item label="Reporting manager">
        {e.reportingManagerId ? (
          <Link to={`/employees/${e.reportingManagerId}`}>
            {e.reportingManager} ({e.reportingManagerCode})
          </Link>
        ) : (
          '—'
        )}
      </Descriptions.Item>
      <Descriptions.Item label="Employment type">{e.employmentType}</Descriptions.Item>
      <Descriptions.Item label="Status">
        <Tag color={e.statusColor}>{e.status}</Tag>
      </Descriptions.Item>
      <Descriptions.Item label="Joining date">{formatDate(e.joiningDate)}</Descriptions.Item>
      <Descriptions.Item label="Probation end">{formatDate(e.probationEndDate)}</Descriptions.Item>
      <Descriptions.Item label="Confirmation date">{formatDate(e.confirmationDate)}</Descriptions.Item>
      <Descriptions.Item label="Exit date">{formatDate(e.exitDate)}</Descriptions.Item>
      <Descriptions.Item label="Direct reports">{e.directReportCount}</Descriptions.Item>
    </Descriptions>
    </>
  );
}
