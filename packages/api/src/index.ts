// @urugendo/api – Supabase client + shared queries
// Connects to the EXISTING Supabase project (same backend as PWA)
// Never changes the backend schema without explicit approval.

export const API_VERSION = '0.1.0';

export type UserRole =
  | 'passenger'
  | 'agent'
  | 'checker'
  | 'manager'
  | 'boss';
