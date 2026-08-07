import { endpoint } from "@shared/constants/api-core";

export {
  ROLE_GROUPS,
  ROLE_PRIORITY,
  endpoint,
} from "@shared/constants/api-core";
export type { ApiEndpoint } from "@shared/constants/api-core";

export const ROUTE_BASE = {
  API: "/api",
  AUTH: "/api/auth",
  USERS: "/api/users",
  CHATFLOW: "/api/chat",
} as const;

export const HEALTH_ENDPOINTS = {
  GENERAL: endpoint("GET", ROUTE_BASE.API, ""),
  DUMMY: endpoint("GET", ROUTE_BASE.API, "/dummy"),
  DUMMY_POST: endpoint("POST", ROUTE_BASE.API, "/dummy"),
};

export const AUTH_ENDPOINTS = {
  LOGIN: endpoint("POST", ROUTE_BASE.AUTH, "/login"),
  LOGOUT: endpoint("POST", ROUTE_BASE.AUTH, "/logout"),
  REGISTER: endpoint("POST", ROUTE_BASE.AUTH, "/register"),
  RESET_PASSWORD: endpoint("POST", ROUTE_BASE.AUTH, "/reset-password"),
};

export const USERS_ENDPOINTS = {
  LIST: endpoint("GET", ROUTE_BASE.USERS, ""),
  GET_BY_ID: endpoint("GET", ROUTE_BASE.USERS, "/:id"),
  CREATE: endpoint("POST", ROUTE_BASE.USERS, ""),
  UPDATE: endpoint("PATCH", ROUTE_BASE.USERS, "/:id"),
};

export const CHATFLOW_ENDPOINTS = {
  CREATE: endpoint("POST", ROUTE_BASE.CHATFLOW, "/create"),
  EXECUTE: endpoint("POST", ROUTE_BASE.CHATFLOW, "/:id/execute"),
};

export const API_ENDPOINTS = {
  HEALTH: HEALTH_ENDPOINTS,
  AUTH: AUTH_ENDPOINTS,
  USERS: USERS_ENDPOINTS,
  CHATFLOW: CHATFLOW_ENDPOINTS,
};
