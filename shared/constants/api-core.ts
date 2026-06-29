import { UserRole } from '../schemas/auth.schema';

const getCombinations = <T>(array: T[]): T[][] => {
  const result: T[][] = [];

  const helper = (start: number, combo: T[]) => {
    if (combo.length > 0) {
      result.push([...combo]);
    }

    for (let i = start; i < array.length; i++) {
      combo.push(array[i]);
      helper(i + 1, combo);
      combo.pop();
    }
  };

  helper(0, []);
  return result;
};

const roles = [UserRole.ADMIN, UserRole.USER];

export const ROLE_PRIORITY: Record<UserRole, number> = {
  [UserRole.ADMIN]: 1,
  [UserRole.USER]: 2,
};

const normalizeRoles = (roleList: UserRole[]) =>
  [...roleList].sort((a, b) => ROLE_PRIORITY[a] - ROLE_PRIORITY[b]);

export const ROLE_GROUPS = Object.fromEntries(
  getCombinations(roles).map((combo) => {
    const normalized = normalizeRoles(combo);
    return [normalized.join('_').toUpperCase(), normalized];
  })
);

export interface ApiEndpoint {
  path: string;
  method: string;
  url: string;
}

export const endpoint = (
  method: string,
  base: string,
  path = ''
): ApiEndpoint => ({
  method,
  url: `${base}${path}`,
  path,
});
