import { Alert, App, Col, Form, Input, InputNumber, Row, Select, Switch, Tag } from 'antd';
import type { FormInstance, FormRule } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { FormDrawer } from '@/shared/components';
import { toOptions, useLookups } from '@/shared/lookups/useLookups';
import type { LookupItem } from '@/shared/lookups/types';
import { applyFormErrors, getErrorMessage } from '@/shared/utils/errors';
import { useMasterMutations } from './masterApi';
import { TAG_COLORS, type MasterConfig, type MasterField, type MasterRecord } from './types';

interface MasterFormDrawerProps<T extends MasterRecord> {
  config: MasterConfig<T>;
  open: boolean;
  /** Record being edited; undefined = create. */
  record?: T;
  /** Values pre-filled when creating (e.g. the parent department). */
  initialValues?: Record<string, unknown>;
  onClose: () => void;
  onSaved?: (record: T) => void;
}

/** Create/edit drawer generated from the field list in a MasterConfig. */
export function MasterFormDrawer<T extends MasterRecord>({
  config,
  open,
  record,
  initialValues,
  onClose,
  onSaved,
}: MasterFormDrawerProps<T>) {
  const isEdit = !!record;
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [error, setError] = useState<string | null>(null);
  const { create, update } = useMasterMutations<T>(config.queryKey, config.urls);

  const lookupKeys = useMemo(
    () => config.fields.filter((f) => f.type === 'lookup' && f.lookupKey).map((f) => f.lookupKey!),
    [config.fields],
  );
  const lookups = useLookups(lookupKeys, open && lookupKeys.length > 0);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (record) {
      form.setFieldsValue(config.toFormValues ? config.toFormValues(record) : { ...record });
    } else {
      const defaults = Object.fromEntries(
        config.fields.filter((f) => f.defaultValue !== undefined).map((f) => [f.name, f.defaultValue]),
      );
      form.setFieldsValue({ ...defaults, ...initialValues });
    }
  }, [open, record, initialValues, config, form]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  /** Clear a child dropdown when its parent changes (e.g. city when country changes). */
  const onValuesChange = (changed: Record<string, unknown>) => {
    const dependents = config.fields.filter((f) => f.dependsOn && f.dependsOn in changed);
    if (dependents.length) form.setFieldsValue(Object.fromEntries(dependents.map((f) => [f.name, null])));
  };

  const onSubmit = async () => {
    const values = await form.validateFields();
    const body = Object.fromEntries(
      config.fields.map((f) => [
        f.name,
        values[f.name] === undefined || values[f.name] === '' ? null : values[f.name],
      ]),
    );
    for (const f of config.fields) {
      if (f.type === 'switch') body[f.name] = !!values[f.name];
      if (f.type === 'number' && body[f.name] === null && f.required) body[f.name] = 0;
    }
    setError(null);
    const callbacks = {
      onSuccess: (saved: T) => {
        message.success(`${config.label} ${isEdit ? 'updated' : 'created'}.`);
        handleClose();
        onSaved?.(saved);
      },
      onError: (err: unknown) => {
        if (!applyFormErrors(form, err)) setError(getErrorMessage(err));
      },
    };
    if (isEdit) update.mutate({ id: record.id, body }, callbacks);
    else create.mutate(body, callbacks);
  };

  return (
    <FormDrawer
      open={open}
      title={isEdit ? `Edit ${config.label.toLowerCase()}` : `New ${config.label.toLowerCase()}`}
      onClose={handleClose}
      onSubmit={onSubmit}
      submitting={create.isPending || update.isPending}
      submitText={isEdit ? 'Save changes' : `Create ${config.label.toLowerCase()}`}
      width={config.drawerWidth ?? 560}
    >
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
      {record?.isSystem && (
        <Alert
          type="info"
          showIcon
          title={`System ${config.label.toLowerCase()} – the application relies on its code, so some fields are locked.`}
          style={{ marginBottom: 16 }}
        />
      )}
      <Form form={form} layout="vertical" onValuesChange={onValuesChange} requiredMark="optional">
        <Row gutter={16}>
          {config.fields.map((field) => (
            <Col key={field.name} xs={24} sm={field.half ? 12 : 24}>
              <FieldItem
                field={field}
                record={record}
                form={form}
                lookups={lookups.data}
                loading={lookups.isLoading}
              />
            </Col>
          ))}
        </Row>
      </Form>
    </FormDrawer>
  );
}

interface FieldItemProps<T extends MasterRecord> {
  field: MasterField<T>;
  record?: T;
  form: FormInstance;
  lookups?: Record<string, LookupItem[]>;
  loading: boolean;
}

function FieldItem<T extends MasterRecord>({ field, record, form, lookups, loading }: FieldItemProps<T>) {
  const parentValue = Form.useWatch(field.dependsOn ?? '__none__', form) as number | null | undefined;
  const allValues = Form.useWatch([], form) as Record<string, unknown> | undefined;
  if (field.visible && !field.visible(allValues ?? {})) {
    return null;
  }
  const disabled =
    (field.createOnly && !!record) ||
    (field.lockedForSystem && !!record?.isSystem) ||
    (field.disabled?.(record) ?? false);

  const rules: FormRule[] = [];
  if (field.required) rules.push({ required: true, message: `${field.label} is required.` });
  if (field.max) rules.push({ max: field.max });
  for (const rule of field.rules ?? []) rules.push(rule);

  const common = { disabled, placeholder: field.placeholder };
  let input;
  switch (field.type) {
    case 'textarea':
      input = <Input.TextArea rows={3} showCount maxLength={field.max} {...common} />;
      break;
    case 'number':
      input = <InputNumber min={field.min} max={field.maxValue} style={{ width: '100%' }} {...common} />;
      break;
    case 'switch':
      return (
        <Form.Item name={field.name} label={field.label} tooltip={field.tooltip} valuePropName="checked">
          <Switch disabled={disabled} />
        </Form.Item>
      );
    case 'select':
      input = <Select allowClear={!field.required} options={field.options} {...common} />;
      break;
    case 'tags':
      input = <Select mode="tags" tokenSeparators={[',']} open={false} suffixIcon={null} {...common} />;
      break;
    case 'color':
      input = (
        <Select
          {...common}
          options={TAG_COLORS.map((c) => ({ value: c, label: <Tag color={c}>{c}</Tag> }))}
        />
      );
      break;
    case 'lookup': {
      const items = lookups?.[field.lookupKey!];
      const options = field.dependsOn ? toOptions(items, parentValue ?? -1) : toOptions(items);
      input = (
        <Select
          showSearch={{ optionFilterProp: 'label' }}
          allowClear={!field.required}
          loading={loading}
          options={options}
          notFoundContent={field.dependsOn && !parentValue ? 'Select the parent first' : undefined}
          {...common}
        />
      );
      break;
    }
    default:
      input = (
        <Input
          maxLength={field.max}
          {...common}
          style={field.name === 'code' ? { textTransform: 'uppercase' } : undefined}
        />
      );
  }

  return (
    <Form.Item name={field.name} label={field.label} tooltip={field.tooltip} rules={rules}>
      {input}
    </Form.Item>
  );
}
