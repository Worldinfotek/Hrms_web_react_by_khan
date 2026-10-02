import { Alert, App, DatePicker, Form, Input, Modal, Select, Tag, Typography } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { toOptions, useLookups } from '@/shared/lookups/useLookups';
import { applyFormErrors, getErrorMessage } from '@/shared/utils/errors';
import { useAllowedStatuses, useEmployeeAction } from '../api/employeesApi';
import type { EmployeeActionKind, EmployeeDetail } from '../types';
import { EmployeeSelect } from './EmployeeSelect';

const TITLES: Record<EmployeeActionKind, string> = {
  transfer: 'Transfer employee',
  promote: 'Promote / change designation',
  'change-manager': 'Change reporting manager',
  'change-status': 'Change status',
};

interface EmployeeActionModalProps {
  kind: EmployeeActionKind | null;
  employee: EmployeeDetail;
  onClose: () => void;
}

interface ActionFormValues {
  branchId?: number;
  departmentId?: number;
  teamId?: number | null;
  designationId?: number;
  reportingManagerId?: number | null;
  employeeStatusId?: number;
  effectiveDate: Dayjs;
  remarks?: string;
}

/**
 * Transfer / Promote / Change manager / Change status. Each action is stored in the
 * employee's history with its effective date and remarks.
 */
export function EmployeeActionModal({ kind, employee, onClose }: EmployeeActionModalProps) {
  const [form] = Form.useForm<ActionFormValues>();
  const { message } = App.useApp();
  const [error, setError] = useState<string | null>(null);
  const action = useEmployeeAction();
  const lookups = useLookups(
    ['branches', 'departments', 'teams', 'designations'],
    kind === 'transfer' || kind === 'promote',
  );
  const statuses = useAllowedStatuses(employee.id, kind === 'change-status');
  const departmentId = Form.useWatch('departmentId', form);

  useEffect(() => {
    if (!kind) return;
    form.resetFields();
    form.setFieldsValue({
      effectiveDate: dayjs(),
      branchId: employee.branchId,
      departmentId: employee.departmentId,
      teamId: employee.teamId,
      designationId: employee.designationId,
      reportingManagerId: employee.reportingManagerId,
    });
  }, [kind, employee, form]);

  const close = () => {
    setError(null);
    onClose();
  };

  const submit = async () => {
    if (!kind) return;
    const values = await form.validateFields();
    const effectiveDate = values.effectiveDate.format('YYYY-MM-DD');
    const body =
      kind === 'transfer'
        ? { branchId: values.branchId, departmentId: values.departmentId, teamId: values.teamId ?? null }
        : kind === 'promote'
          ? { designationId: values.designationId }
          : kind === 'change-manager'
            ? { reportingManagerId: values.reportingManagerId ?? null }
            : { employeeStatusId: values.employeeStatusId };
    setError(null);
    action.mutate(
      { id: employee.id, kind, body: { ...body, effectiveDate, remarks: values.remarks } },
      {
        onSuccess: () => {
          message.success(`${TITLES[kind]} – saved to the employee's history.`);
          close();
        },
        onError: (err) => {
          if (!applyFormErrors(form, err)) setError(getErrorMessage(err));
        },
      },
    );
  };

  const teams = (lookups.data?.teams ?? []).filter((t) => t.parentId === departmentId);

  return (
    <Modal
      open={!!kind}
      title={kind ? TITLES[kind] : ''}
      onCancel={close}
      onOk={submit}
      okText="Save"
      confirmLoading={action.isPending}
      destroyOnHidden
    >
      <Typography.Paragraph type="secondary">
        {employee.fullName} · {employee.employeeCode}
      </Typography.Paragraph>
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
      <Form form={form} layout="vertical" requiredMark="optional">
        {kind === 'transfer' && (
          <>
            <Form.Item name="branchId" label="Branch / location" rules={[{ required: true }]}>
              <Select
                showSearch={{ optionFilterProp: 'label' }}
                options={toOptions(lookups.data?.branches)}
                loading={lookups.isLoading}
              />
            </Form.Item>
            <Form.Item name="departmentId" label="Department" rules={[{ required: true }]}>
              <Select
                showSearch={{ optionFilterProp: 'label' }}
                options={toOptions(lookups.data?.departments)}
                onChange={() => form.setFieldValue('teamId', null)}
              />
            </Form.Item>
            <Form.Item name="teamId" label="Team">
              <Select
                allowClear
                options={toOptions(teams)}
                placeholder={teams.length ? 'No team' : 'This department has no teams'}
              />
            </Form.Item>
          </>
        )}
        {kind === 'promote' && (
          <Form.Item
            name="designationId"
            label="New designation"
            rules={[{ required: true }]}
            extra={`Current: ${employee.designation}`}
          >
            <Select
              showSearch={{ optionFilterProp: 'label' }}
              options={toOptions(lookups.data?.designations)}
              loading={lookups.isLoading}
            />
          </Form.Item>
        )}
        {kind === 'change-manager' && (
          <Form.Item
            name="reportingManagerId"
            label="New reporting manager"
            extra={`Current: ${employee.reportingManager ?? 'none'}. Leave empty for no manager.`}
          >
            <EmployeeSelect
              allowClear
              excludeId={employee.id}
              placeholder="Search by name or code"
              initialLabel={employee.reportingManager}
            />
          </Form.Item>
        )}
        {kind === 'change-status' && (
          <Form.Item
            name="employeeStatusId"
            label="New status"
            rules={[{ required: true, message: 'Select the new status.' }]}
            extra={
              <span>
                Current: <Tag color={employee.statusColor}>{employee.status}</Tag> Only allowed changes are
                listed.
              </span>
            }
          >
            <Select
              loading={statuses.isLoading}
              options={(statuses.data ?? []).map((s) => ({
                value: s.id,
                label: (
                  <span>
                    <Tag color={s.color}>{s.name}</Tag>
                    {!s.isActiveEmployment && (
                      <Typography.Text type="danger">leaves the company – login is disabled</Typography.Text>
                    )}
                  </span>
                ),
              }))}
            />
          </Form.Item>
        )}
        <Form.Item name="effectiveDate" label="Effective date" rules={[{ required: true }]}>
          <DatePicker
            style={{ width: '100%' }}
            format="DD MMM YYYY"
            disabledDate={(d) => d.isBefore(dayjs(employee.joiningDate), 'day')}
          />
        </Form.Item>
        <Form.Item name="remarks" label="Remarks" rules={[{ max: 1000 }]}>
          <Input.TextArea
            rows={3}
            showCount
            maxLength={1000}
            placeholder="Reason / reference (kept in history)"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
