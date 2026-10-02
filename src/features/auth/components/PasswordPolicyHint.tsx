import { CheckCircleFilled, CloseCircleOutlined } from '@ant-design/icons';
import { Flex, Typography } from 'antd';
import { brandColors } from '@/theme/themeConfig';

const RULES: { label: string; test: (value: string) => boolean }[] = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'An upper-case letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'A lower-case letter', test: (v) => /[a-z]/.test(v) },
  { label: 'A digit', test: (v) => /[0-9]/.test(v) },
  { label: 'A symbol (! @ # $ …)', test: (v) => /[^a-zA-Z0-9]/.test(v) },
];

/** Live checklist of the password policy under a password field. */
export function PasswordPolicyHint({ value }: { value?: string }) {
  const password = value ?? '';
  return (
    <Flex vertical gap={2} style={{ marginTop: -8, marginBottom: 16 }}>
      {RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <Typography.Text key={rule.label} type={ok ? undefined : 'secondary'} style={{ fontSize: 12 }}>
            {ok ? (
              <CheckCircleFilled style={{ color: brandColors.secondary, marginRight: 6 }} />
            ) : (
              <CloseCircleOutlined style={{ marginRight: 6 }} />
            )}
            {rule.label}
          </Typography.Text>
        );
      })}
    </Flex>
  );
}
