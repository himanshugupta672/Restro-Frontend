import { USER_ROLES, type UserRole } from "@/features/auth";

const allRoles = [
  USER_ROLES.admin,
  USER_ROLES.chef,
  USER_ROLES.customer,
] as const satisfies readonly UserRole[];

export const routeAccess = {
  dashboard: allRoles,
  menu: [USER_ROLES.admin],
  orders: [USER_ROLES.admin, USER_ROLES.chef],
  tables: [USER_ROLES.admin],
  customers: [USER_ROLES.admin],
  reports: [USER_ROLES.admin],
} as const satisfies Record<string, readonly UserRole[]>;
