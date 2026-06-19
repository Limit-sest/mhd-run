export interface Context {
  isAdmin: boolean;
}

/**
 * Simple password auth: the client sends the configured ADMIN_PASSWORD as a
 * Bearer token on every request. No sessions, no user accounts — this is an
 * internal content-management tool.
 */
export function isValidToken(token: string | null | undefined): boolean {
  const password = process.env.ADMIN_PASSWORD;
  return Boolean(password) && typeof token === 'string' && token === password;
}
