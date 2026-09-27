export function isConfiguredAdmin(email: string) {
  const allowed = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(allowed && allowed === email);
}
