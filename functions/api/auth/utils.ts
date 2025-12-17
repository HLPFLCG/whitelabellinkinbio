// Utility functions for authentication

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function getCookie(request: Request, name: string): string | null {
  const cookie = request.headers.get('Cookie');
  if (!cookie) return null;
  
  const match = cookie.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : null;
}

export async function getSessionUser(request: Request, env: any) {
  const sessionId = getCookie(request, 'session');
  
  if (!sessionId) {
    return null;
  }
  
  const session = await env.DB.prepare(
    'SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime("now")'
  ).bind(sessionId).first();
  
  if (!session) {
    return null;
  }
  
  const user = await env.DB.prepare(
    'SELECT u.id, u.email, p.username, p.display_name FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.id = ?'
  ).bind(session.user_id).first();
  
  return user;
}