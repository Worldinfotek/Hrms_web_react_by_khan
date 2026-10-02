import { ArrowLeftOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Alert,
  App,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Steps,
  Switch,
  Tag,
  Typography,
} from 'antd';
import type { FormInstance } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '@/api/types';
import { PageHeader, PageLoader } from '@/shared/components';
import { toOptions, useLookups } from '@/shared/lookups/useLookups';
import type { LookupItem } from '@/shared/lookups/types';
import { getErrorMessage } from '@/shared/utils/errors';
import {
  useActiveCustomFields,
  useCreateEmployee,
  useEmployee,
  useInitialStatuses,
  useUpdateEmployee,
} from '../api/employeesApi';
import { EmployeeSelect } from '../components/EmployeeSelect';
import type { Address, CustomFieldDefinition, EmployeeDetail, EmployeeRequest } from '../types';

const LOOKUPS = [
  'gender',
  'maritalStatus',
  'bloodGroup',
  'country',
  'city',
  'relationship',
  'branches',
  'departments',
  'teams',
  'designations',
  'employmentTypes',
];

const phoneRule = { pattern: /^\+?[0-9\s()-]{7,30}$/, message: 'Phone number is not valid.' };
const nameRule = {
  pattern: /^[\p{L}][\p{L} .'-]*$/u,
  message: 'Letters, spaces, dots, apostrophes and hyphens only.',
};

type AddressForm = { addressLine?: string; countryId?: number; cityId?: number; postalCode?: string };
type FormValues = {
  firstName: string;
  middleName?: string;
  lastName: string;
  fatherName?: string;
  genderId?: number;
  dateOfBirth?: Dayjs;
  maritalStatusId?: number;
  bloodGroupId?: number;
  nationalityId?: number;
  cnic?: string;
  workEmail?: string;
  personalEmail?: string;
  mobilePhone?: string;
  workPhone?: string;
  currentAddress?: AddressForm;
  sameAsCurrent?: boolean;
  permanentAddress?: AddressForm;
  emergencyContacts?: {
    name: string;
    relationshipId?: number;
    phone: string;
    alternatePhone?: string;
    isPrimary?: boolean;
  }[];
  joiningDate: Dayjs;
  employmentTypeId: number;
  employeeStatusId?: number;
  probationEndDate?: Dayjs;
  branchId: number;
  departmentId: number;
  teamId?: number;
  designationId: number;
  reportingManagerId?: number;
  custom?: Record<string, unknown>;
};

/** Field names per step – used for step validation and to jump to the step of a server error. */
const STEP_FIELDS: string[][] = [
  [
    'firstName',
    'middleName',
    'lastName',
    'fatherName',
    'genderId',
    'dateOfBirth',
    'maritalStatusId',
    'bloodGroupId',
    'nationalityId',
    'cnic',
  ],
  [
    'workEmail',
    'personalEmail',
    'mobilePhone',
    'workPhone',
    'currentAddress',
    'permanentAddress',
    'emergencyContacts',
  ],
  [
    'joiningDate',
    'employmentTypeId',
    'employeeStatusId',
    'probationEndDate',
    'branchId',
    'departmentId',
    'teamId',
    'designationId',
    'reportingManagerId',
  ],
  ['custom'],
];

const date = (d?: Dayjs | null) => (d ? d.format('YYYY-MM-DD') : null);
const address = (a?: AddressForm): Address | null =>
  a && (a.addressLine || a.cityId || a.countryId || a.postalCode)
    ? {
        addressLine: a.addressLine ?? null,
        cityId: a.cityId ?? null,
        countryId: a.countryId ?? null,
        postalCode: a.postalCode ?? null,
      }
    : null;

export default function EmployeeFormPage() {
  const { id } = useParams();
  const employeeId = id ? Number(id) : undefined;
  const isEdit = !!employeeId;
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm<FormValues>();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const employee = useEmployee(employeeId);
  const lookups = useLookups(LOOKUPS);
  const fields = useActiveCustomFields();
  const statuses = useInitialStatuses(!isEdit);
  const create = useCreateEmployee();
  const update = useUpdateEmployee();

  const customFields = fields.data ?? [];
  const steps = useMemo(
    () => [
      { title: 'Personal' },
      { title: 'Contact' },
      { title: 'Employment' },
      ...(customFields.length ? [{ title: 'Additional' }] : []),
      { title: 'Review' },
    ],
    [customFields.length],
  );
  const reviewStep = steps.length - 1;

  useEffect(() => {
    if (employee.data) form.setFieldsValue(toFormValues(employee.data));
  }, [employee.data, form]);

  useEffect(() => {
    if (!isEdit && statuses.data?.length && !form.getFieldValue('employeeStatusId')) {
      form.setFieldValue(
        'employeeStatusId',
        statuses.data.find((s) => s.code === 'PROBATION')?.id ?? statuses.data[0].id,
      );
    }
  }, [isEdit, statuses.data, form]);

  if (isEdit && employee.isLoading) return <PageLoader />;

  const next = async () => {
    try {
      await form.validateFields(STEP_FIELDS[step] ?? [], { recursive: true });
      setStep((s) => Math.min(s + 1, reviewStep));
    } catch {
      message.warning('Please fix the highlighted fields.');
    }
  };

  const submit = async () => {
    const v = form.getFieldsValue(true) as FormValues;
    const body: EmployeeRequest = {
      firstName: v.firstName,
      middleName: v.middleName || null,
      lastName: v.lastName,
      fatherName: v.fatherName || null,
      genderId: v.genderId ?? null,
      dateOfBirth: date(v.dateOfBirth),
      maritalStatusId: v.maritalStatusId ?? null,
      bloodGroupId: v.bloodGroupId ?? null,
      nationalityId: v.nationalityId ?? null,
      cnic: v.cnic || null,
      workEmail: v.workEmail || null,
      personalEmail: v.personalEmail || null,
      mobilePhone: v.mobilePhone || null,
      workPhone: v.workPhone || null,
      currentAddress: address(v.currentAddress),
      permanentAddress: address(v.sameAsCurrent ? v.currentAddress : v.permanentAddress),
      emergencyContacts: (v.emergencyContacts ?? [])
        .filter((c) => c?.name || c?.phone)
        .map((c) => ({
          name: c.name,
          relationshipId: c.relationshipId ?? null,
          phone: c.phone,
          alternatePhone: c.alternatePhone || null,
          address: null,
          isPrimary: !!c.isPrimary,
        })),
      customFields: customFields.map((f) => ({ fieldId: f.id, value: customValue(f, v.custom?.[f.code]) })),
      joiningDate: date(v.joiningDate)!,
      employmentTypeId: v.employmentTypeId,
      probationEndDate: date(v.probationEndDate),
      ...(isEdit
        ? {}
        : {
            branchId: v.branchId,
            departmentId: v.departmentId,
            teamId: v.teamId ?? null,
            designationId: v.designationId,
            reportingManagerId: v.reportingManagerId ?? null,
            employeeStatusId: v.employeeStatusId ?? null,
          }),
    };

    setError(null);
    const onError = (err: unknown) => {
      if (err instanceof ApiError && Object.keys(err.errors).length) {
        // Show field errors where they belong and jump to the first step that has one.
        const entries = Object.entries(err.errors);
        form.setFields(
          entries
            .filter(([k]) => !k.includes('.') && !k.includes('['))
            .map(([name, errors]) => ({ name, errors })),
        );
        const firstStep = STEP_FIELDS.findIndex((names) =>
          entries.some(([k]) => names.some((n) => k === n || k.startsWith(n + '.') || k.startsWith(n + '['))),
        );
        if (firstStep >= 0) setStep(Math.min(firstStep, reviewStep));
        setError(`${err.message} ${entries.map(([, e]) => e.join(' ')).join(' ')}`);
      } else {
        setError(getErrorMessage(err));
      }
    };

    if (isEdit) {
      update.mutate(
        { id: employeeId, body },
        {
          onSuccess: () => {
            message.success('Employee updated.');
            navigate(`/employees/${employeeId}`);
          },
          onError,
        },
      );
    } else {
      create.mutate(body, {
        onSuccess: (created) => {
          message.success(`Employee ${created.employeeCode} created.`);
          navigate(`/employees/${created.id}`);
        },
        onError,
      });
    }
  };

  return (
    <>
      <PageHeader
        title={isEdit ? `Edit ${employee.data?.fullName ?? 'employee'}` : 'Add employee'}
        subtitle={
          isEdit
            ? `${employee.data?.employeeCode} · job changes (transfer, promotion, manager, status) are made from the profile actions`
            : 'Entered once – reused by attendance, leave, payroll and every other module'
        }
        actions={
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(isEdit ? `/employees/${employeeId}` : '/employees')}
          >
            Back
          </Button>
        }
      />
      <Card>
        <Steps
          current={step}
          items={steps}
          onChange={(s) => s < step && setStep(s)}
          style={{ marginBottom: 24 }}
          size="small"
        />
        {error && (
          <Alert
            type="error"
            showIcon
            title={error}
            style={{ marginBottom: 16 }}
            closable
            onClose={() => setError(null)}
          />
        )}
        <Form
          form={form}
          layout="vertical"
          requiredMark="optional"
          preserve
          initialValues={{ emergencyContacts: [{ isPrimary: true }] }}
        >
          <div hidden={step !== 0}>
            <PersonalStep lookups={lookups.data} />
          </div>
          <div hidden={step !== 1}>
            <ContactStep form={form} lookups={lookups.data} />
          </div>
          <div hidden={step !== 2}>
            <EmploymentStep
              form={form}
              lookups={lookups.data}
              isEdit={isEdit}
              employee={employee.data}
              statuses={statuses.data ?? []}
            />
          </div>
          {customFields.length > 0 && (
            <div hidden={step !== 3}>
              <CustomStep fields={customFields} />
            </div>
          )}
          {step === reviewStep && (
            <ReviewStep
              form={form}
              lookups={lookups.data}
              customFields={customFields}
              isEdit={isEdit}
              employee={employee.data}
            />
          )}
        </Form>
        <Divider />
        <Flex justify="space-between">
          <Button disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Previous
          </Button>
          {step < reviewStep ? (
            <Button type="primary" onClick={next}>
              Next
            </Button>
          ) : (
            <Button type="primary" onClick={submit} loading={create.isPending || update.isPending}>
              {isEdit ? 'Save changes' : 'Create employee'}
            </Button>
          )}
        </Flex>
      </Card>
    </>
  );
}

type Lookups = Record<string, LookupItem[]> | undefined;

function PersonalStep({ lookups }: { lookups: Lookups }) {
  return (
    <Row gutter={16}>
      <Col xs={24} md={8}>
        <Form.Item name="firstName" label="First name" rules={[{ required: true }, { max: 100 }, nameRule]}>
          <Input autoFocus />
        </Form.Item>
      </Col>
      <Col xs={24} md={8}>
        <Form.Item name="middleName" label="Middle name" rules={[{ max: 100 }]}>
          <Input />
        </Form.Item>
      </Col>
      <Col xs={24} md={8}>
        <Form.Item name="lastName" label="Last name" rules={[{ required: true }, { max: 100 }, nameRule]}>
          <Input />
        </Form.Item>
      </Col>
      <Col xs={24} md={8}>
        <Form.Item name="fatherName" label="Father's name" rules={[{ max: 150 }]}>
          <Input />
        </Form.Item>
      </Col>
      <Col xs={24} md={8}>
        <Form.Item
          name="cnic"
          label="CNIC"
          rules={[{ pattern: /^\d{5}-?\d{7}-?\d$/, message: '13 digits, e.g. 35202-1234567-1' }]}
        >
          <Input placeholder="35202-1234567-1" maxLength={15} />
        </Form.Item>
      </Col>
      <Col xs={24} md={8}>
        <Form.Item name="dateOfBirth" label="Date of birth">
          <DatePicker
            style={{ width: '100%' }}
            format="DD MMM YYYY"
            disabledDate={(d) => d.isAfter(dayjs().subtract(15, 'year'))}
            defaultPickerValue={dayjs().subtract(25, 'year')}
          />
        </Form.Item>
      </Col>
      <Col xs={12} md={6}>
        <Form.Item name="genderId" label="Gender">
          <Select allowClear options={toOptions(lookups?.gender)} />
        </Form.Item>
      </Col>
      <Col xs={12} md={6}>
        <Form.Item name="maritalStatusId" label="Marital status">
          <Select allowClear options={toOptions(lookups?.maritalStatus)} />
        </Form.Item>
      </Col>
      <Col xs={12} md={6}>
        <Form.Item name="bloodGroupId" label="Blood group">
          <Select allowClear options={toOptions(lookups?.bloodGroup)} />
        </Form.Item>
      </Col>
      <Col xs={12} md={6}>
        <Form.Item name="nationalityId" label="Nationality">
          <Select
            allowClear
            showSearch={{ optionFilterProp: 'label' }}
            options={toOptions(lookups?.country)}
          />
        </Form.Item>
      </Col>
    </Row>
  );
}

function AddressFields({
  prefix,
  form,
  lookups,
  disabled,
}: {
  prefix: string;
  form: FormInstance;
  lookups: Lookups;
  disabled?: boolean;
}) {
  const countryId = Form.useWatch([prefix, 'countryId'], form) as number | undefined;
  return (
    <Row gutter={16}>
      <Col xs={24}>
        <Form.Item name={[prefix, 'addressLine']} label="Address" rules={[{ max: 500 }]}>
          <Input.TextArea rows={2} disabled={disabled} />
        </Form.Item>
      </Col>
      <Col xs={24} md={8}>
        <Form.Item name={[prefix, 'countryId']} label="Country">
          <Select
            allowClear
            showSearch={{ optionFilterProp: 'label' }}
            options={toOptions(lookups?.country)}
            disabled={disabled}
            onChange={() => form.setFieldValue([prefix, 'cityId'], undefined)}
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={8}>
        <Form.Item name={[prefix, 'cityId']} label="City">
          <Select
            allowClear
            showSearch={{ optionFilterProp: 'label' }}
            options={toOptions(lookups?.city, countryId ?? -1)}
            disabled={disabled || !countryId}
            placeholder={countryId ? undefined : 'Select the country first'}
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={8}>
        <Form.Item name={[prefix, 'postalCode']} label="Postal code" rules={[{ max: 20 }]}>
          <Input disabled={disabled} />
        </Form.Item>
      </Col>
    </Row>
  );
}

function ContactStep({ form, lookups }: { form: FormInstance; lookups: Lookups }) {
  const same = Form.useWatch('sameAsCurrent', form) as boolean | undefined;
  return (
    <>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="workEmail" label="Work e-mail" rules={[{ type: 'email' }, { max: 256 }]}>
            <Input placeholder="name@worldinfotek.com" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="personalEmail" label="Personal e-mail" rules={[{ type: 'email' }, { max: 256 }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="mobilePhone" label="Mobile" rules={[phoneRule]}>
            <Input placeholder="+92 300 1234567" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="workPhone" label="Work phone / ext." rules={[phoneRule]}>
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Typography.Title level={5}>Current address</Typography.Title>
      <AddressFields prefix="currentAddress" form={form} lookups={lookups} />
      <Flex justify="space-between" align="center">
        <Typography.Title level={5} style={{ margin: 0 }}>
          Permanent address
        </Typography.Title>
        <Form.Item name="sameAsCurrent" valuePropName="checked" noStyle>
          <Checkbox>Same as current</Checkbox>
        </Form.Item>
      </Flex>
      <div style={{ marginTop: 12 }}>
        <AddressFields prefix="permanentAddress" form={form} lookups={lookups} disabled={same} />
      </div>
      <Typography.Title level={5}>Emergency contacts</Typography.Title>
      <Form.List name="emergencyContacts">
        {(items, { add, remove }) => (
          <>
            {items.map(({ key, name }) => (
              <Card key={key} size="small" style={{ marginBottom: 12 }}>
                <Row gutter={12} align="bottom">
                  <Col xs={24} md={6}>
                    <Form.Item
                      name={[name, 'name']}
                      label="Name"
                      rules={[{ required: true, message: 'Name is required.' }, { max: 150 }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={5}>
                    <Form.Item name={[name, 'relationshipId']} label="Relationship">
                      <Select allowClear options={toOptions(lookups?.relationship)} />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={5}>
                    <Form.Item
                      name={[name, 'phone']}
                      label="Phone"
                      rules={[{ required: true, message: 'Phone is required.' }, phoneRule]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Item name={[name, 'alternatePhone']} label="Alternate" rules={[phoneRule]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={8} md={3}>
                    <Form.Item name={[name, 'isPrimary']} valuePropName="checked">
                      <Checkbox>Primary</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col xs={4} md={1}>
                    <Form.Item>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                        aria-label="Remove contact"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            ))}
            {items.length < 5 && (
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => add({ isPrimary: items.length === 0 })}
              >
                Add emergency contact
              </Button>
            )}
          </>
        )}
      </Form.List>
    </>
  );
}

function EmploymentStep({
  form,
  lookups,
  isEdit,
  employee,
  statuses,
}: {
  form: FormInstance;
  lookups: Lookups;
  isEdit: boolean;
  employee?: EmployeeDetail;
  statuses: { id: number; name: string; color: string; code: string }[];
}) {
  const departmentId = Form.useWatch('departmentId', form) as number | undefined;
  const teams = (lookups?.teams ?? []).filter((t) => t.parentId === departmentId);
  return (
    <>
      {isEdit && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          title="Department, designation, reporting manager and status are changed with the actions on the profile page, so the change is recorded in the employee's history."
        />
      )}
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item name="joiningDate" label="Joining date" rules={[{ required: true }]}>
            <DatePicker
              style={{ width: '100%' }}
              format="DD MMM YYYY"
              disabledDate={(d) => d.isAfter(dayjs().add(180, 'day'))}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="employmentTypeId" label="Employment type" rules={[{ required: true }]}>
            <Select options={toOptions(lookups?.employmentTypes)} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="branchId" label="Branch / location" rules={[{ required: !isEdit }]}>
            <Select
              disabled={isEdit}
              showSearch={{ optionFilterProp: 'label' }}
              options={toOptions(lookups?.branches)}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="departmentId" label="Department" rules={[{ required: !isEdit }]}>
            <Select
              disabled={isEdit}
              showSearch={{ optionFilterProp: 'label' }}
              options={toOptions(lookups?.departments)}
              onChange={() => form.setFieldValue('teamId', undefined)}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="teamId" label="Team">
            <Select
              disabled={isEdit || teams.length === 0}
              allowClear
              options={toOptions(teams)}
              placeholder={teams.length ? undefined : 'No teams'}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="designationId" label="Designation" rules={[{ required: !isEdit }]}>
            <Select
              disabled={isEdit}
              showSearch={{ optionFilterProp: 'label' }}
              options={toOptions(lookups?.designations)}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="reportingManagerId" label="Reporting manager">
            <EmployeeSelect
              disabled={isEdit}
              allowClear
              excludeId={employee?.id}
              placeholder="Search by name or code"
              initialLabel={employee?.reportingManager}
            />
          </Form.Item>
        </Col>
        {!isEdit && (
          <Col xs={24} md={8}>
            <Form.Item name="employeeStatusId" label="Status" rules={[{ required: true }]}>
              <Select
                options={statuses.map((s) => ({ value: s.id, label: <Tag color={s.color}>{s.name}</Tag> }))}
              />
            </Form.Item>
          </Col>
        )}
        <Col xs={24} md={8}>
          <Form.Item
            name="probationEndDate"
            label="Probation end date"
            extra={isEdit ? undefined : "Empty = joining date + the employment type's default probation."}
          >
            <DatePicker style={{ width: '100%' }} format="DD MMM YYYY" />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}

function CustomStep({ fields }: { fields: CustomFieldDefinition[] }) {
  return (
    <Row gutter={16}>
      {fields.map((f) => (
        <Col key={f.id} xs={24} md={12}>
          <Form.Item
            name={['custom', f.code]}
            label={f.name}
            tooltip={f.description ?? undefined}
            valuePropName={f.fieldType === 'Boolean' ? 'checked' : 'value'}
            rules={
              f.isRequired && f.fieldType !== 'Boolean'
                ? [{ required: true, message: `${f.name} is required.` }]
                : []
            }
          >
            {f.fieldType === 'Number' ? (
              <InputNumber style={{ width: '100%' }} />
            ) : f.fieldType === 'Date' ? (
              <DatePicker style={{ width: '100%' }} format="DD MMM YYYY" />
            ) : f.fieldType === 'Boolean' ? (
              <Switch />
            ) : f.fieldType === 'Select' ? (
              <Select allowClear options={f.options.map((o) => ({ value: o, label: o }))} />
            ) : (
              <Input maxLength={500} />
            )}
          </Form.Item>
        </Col>
      ))}
    </Row>
  );
}

function ReviewStep({
  form,
  lookups,
  customFields,
  isEdit,
  employee,
}: {
  form: FormInstance;
  lookups: Lookups;
  customFields: CustomFieldDefinition[];
  isEdit: boolean;
  employee?: EmployeeDetail;
}) {
  const v = form.getFieldsValue(true) as FormValues;
  const name = (list: string, id?: number | null) =>
    (id ? lookups?.[list]?.find((x) => x.id === id)?.name : undefined) ?? '—';
  const fmt = (d?: Dayjs) => (d ? d.format('DD MMM YYYY') : '—');
  return (
    <>
      <Descriptions title="Personal" size="small" bordered column={{ xs: 1, md: 3 }}>
        <Descriptions.Item label="Name">
          {[v.firstName, v.middleName, v.lastName].filter(Boolean).join(' ')}
        </Descriptions.Item>
        <Descriptions.Item label="Father's name">{v.fatherName || '—'}</Descriptions.Item>
        <Descriptions.Item label="CNIC">{v.cnic || '—'}</Descriptions.Item>
        <Descriptions.Item label="Date of birth">{fmt(v.dateOfBirth)}</Descriptions.Item>
        <Descriptions.Item label="Gender">{name('gender', v.genderId)}</Descriptions.Item>
        <Descriptions.Item label="Marital status">
          {name('maritalStatus', v.maritalStatusId)}
        </Descriptions.Item>
      </Descriptions>
      <Descriptions title="Contact" size="small" bordered column={{ xs: 1, md: 3 }} style={{ marginTop: 16 }}>
        <Descriptions.Item label="Work e-mail">{v.workEmail || '—'}</Descriptions.Item>
        <Descriptions.Item label="Mobile">{v.mobilePhone || '—'}</Descriptions.Item>
        <Descriptions.Item label="Emergency contacts">
          {(v.emergencyContacts ?? []).filter((c) => c?.name).length}
        </Descriptions.Item>
      </Descriptions>
      <Descriptions
        title="Employment"
        size="small"
        bordered
        column={{ xs: 1, md: 3 }}
        style={{ marginTop: 16 }}
      >
        <Descriptions.Item label="Joining date">{fmt(v.joiningDate)}</Descriptions.Item>
        <Descriptions.Item label="Type">{name('employmentTypes', v.employmentTypeId)}</Descriptions.Item>
        <Descriptions.Item label="Code">
          {isEdit ? employee?.employeeCode : 'Generated on save (e.g. WIT-0001)'}
        </Descriptions.Item>
        <Descriptions.Item label="Department">
          {isEdit ? employee?.department : name('departments', v.departmentId)}
        </Descriptions.Item>
        <Descriptions.Item label="Designation">
          {isEdit ? employee?.designation : name('designations', v.designationId)}
        </Descriptions.Item>
        <Descriptions.Item label="Branch">
          {isEdit ? employee?.branch : name('branches', v.branchId)}
        </Descriptions.Item>
      </Descriptions>
      {customFields.length > 0 && (
        <Descriptions
          title="Additional"
          size="small"
          bordered
          column={{ xs: 1, md: 3 }}
          style={{ marginTop: 16 }}
        >
          {customFields.map((f) => (
            <Descriptions.Item key={f.id} label={f.name}>
              {customValue(f, v.custom?.[f.code]) ?? '—'}
            </Descriptions.Item>
          ))}
        </Descriptions>
      )}
    </>
  );
}

function customValue(field: CustomFieldDefinition, value: unknown): string | null {
  if (value === undefined || value === null || value === '')
    return field.fieldType === 'Boolean' ? 'false' : null;
  if (dayjs.isDayjs(value)) return value.format('YYYY-MM-DD');
  return String(value);
}

function toFormValues(e: EmployeeDetail): Partial<FormValues> {
  const addr = (a: Address | null): AddressForm | undefined =>
    a
      ? {
          addressLine: a.addressLine ?? undefined,
          countryId: a.countryId ?? undefined,
          cityId: a.cityId ?? undefined,
          postalCode: a.postalCode ?? undefined,
        }
      : undefined;
  return {
    firstName: e.firstName,
    middleName: e.middleName ?? undefined,
    lastName: e.lastName,
    fatherName: e.fatherName ?? undefined,
    genderId: e.genderId ?? undefined,
    dateOfBirth: e.dateOfBirth ? dayjs(e.dateOfBirth) : undefined,
    maritalStatusId: e.maritalStatusId ?? undefined,
    bloodGroupId: e.bloodGroupId ?? undefined,
    nationalityId: e.nationalityId ?? undefined,
    cnic: e.cnic ?? undefined,
    workEmail: e.workEmail ?? undefined,
    personalEmail: e.personalEmail ?? undefined,
    mobilePhone: e.mobilePhone ?? undefined,
    workPhone: e.workPhone ?? undefined,
    currentAddress: addr(e.currentAddress),
    permanentAddress: addr(e.permanentAddress),
    emergencyContacts: e.emergencyContacts.map((c) => ({
      name: c.name,
      relationshipId: c.relationshipId ?? undefined,
      phone: c.phone,
      alternatePhone: c.alternatePhone ?? undefined,
      isPrimary: c.isPrimary,
    })),
    joiningDate: dayjs(e.joiningDate),
    employmentTypeId: e.employmentTypeId,
    probationEndDate: e.probationEndDate ? dayjs(e.probationEndDate) : undefined,
    branchId: e.branchId,
    departmentId: e.departmentId,
    teamId: e.teamId ?? undefined,
    designationId: e.designationId,
    reportingManagerId: e.reportingManagerId ?? undefined,
    custom: Object.fromEntries(
      e.customFields.map((f) => [
        f.code ?? String(f.fieldId),
        f.fieldType === 'Date' && f.value
          ? dayjs(f.value)
          : f.fieldType === 'Boolean'
            ? f.value === 'true'
            : f.fieldType === 'Number' && f.value
              ? Number(f.value)
              : (f.value ?? undefined),
      ]),
    ),
  };
}
