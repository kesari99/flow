export const pathToRegex = (path: string) => {
  const regex = path.replace(/\/:[^/]+/g, '/[^/]+').replace(/\//g, '\\/');
  return new RegExp(`^${regex}$`);
};

export function validatePasswordStrength(password: string): {
  valid: boolean;
  message?: string;
} {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }

  const rules: Array<{ pattern: RegExp; message: string }> = [
    {
      pattern: /[A-Z]/,
      message: 'Password must contain at least one uppercase letter',
    },
    {
      pattern: /[a-z]/,
      message: 'Password must contain at least one lowercase letter',
    },
    { pattern: /[0-9]/, message: 'Password must contain at least one number' },
    {
      pattern: /[^A-Za-z0-9]/,
      message: 'Password must contain at least one special character',
    },
  ];

  const failedRule = rules.find((rule) => !rule.pattern.test(password));
  return failedRule
    ? { valid: false, message: failedRule.message }
    : { valid: true };
}
