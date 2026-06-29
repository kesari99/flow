import { ROLE_GROUPS } from './api-core';
import { UserRole } from '../schemas/auth.schema';

type RolePolicyMap = Record<string, Record<string, UserRole[]>>;

const ALL_ROLES = ROLE_GROUPS.ADMIN_USER;
const ADMIN_ONLY = ROLE_GROUPS.ADMIN;
const VALID_ROLES = new Set<string>(Object.values(UserRole));

export const ENDPOINT_ROLE_POLICY: RolePolicyMap = {
  HEALTH: {
    GENERAL: ALL_ROLES,
    DUMMY: ALL_ROLES,
    DUMMY_POST: ALL_ROLES,
  },
  AUTH: {
    LOGIN: ALL_ROLES,
    LOGOUT: ALL_ROLES,
    REGISTER: ADMIN_ONLY,
    RESET_PASSWORD: ALL_ROLES,
  },
  USERS: {
    LIST: ADMIN_ONLY,
    GET_BY_ID: ALL_ROLES,
    CREATE: ADMIN_ONLY,
    UPDATE: ALL_ROLES,
  },
};

export const getRolesByRouteKey = (
  routeKey: string,
  endpointKey: string
): UserRole[] => {
  const roles = ENDPOINT_ROLE_POLICY?.[routeKey]?.[endpointKey] ?? [];
  return roles.filter((role): role is UserRole => VALID_ROLES.has(role));
};
