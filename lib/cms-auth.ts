import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const SECRET = new TextEncoder().encode(
  process.env.CMS_JWT_SECRET || 'golesnews-secret-change-in-production-2026',
);
const COOKIE = 'cms_token';
const EXPIRY = '7d';

export interface JwtPayload {
  sub: string;   // user id
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function validatePassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

export const COOKIE_NAME = COOKIE;
