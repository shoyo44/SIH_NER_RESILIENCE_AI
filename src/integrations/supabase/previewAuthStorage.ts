/**
 * Returns the standard localStorage storage adapter for Supabase Auth.
 * Supabase will use this to persist the user session client-side.
 */
export function brokeredPreviewStorage() {
  if (typeof window === 'undefined') return undefined;
  return localStorage;
}
