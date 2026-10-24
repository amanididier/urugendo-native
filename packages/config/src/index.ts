// @urugendo/config – Shared constants and role definitions

export const APP_NAMES = {
  passenger: 'Urugendo',
  agency: 'Urugendo Agency',
} as const;

export const ROLES = {
  PASSENGER: 'passenger',
  AGENT: 'agent',
  CHECKER: 'checker',
  MANAGER: 'manager',
  BOSS: 'boss',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const AGENCY_ROLES: Role[] = [
  ROLES.AGENT,
  ROLES.CHECKER,
  ROLES.MANAGER,
  ROLES.BOSS,
];
