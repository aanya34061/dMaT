import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dmat-secure-app-secret-key-2026-v1';

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (err) {
    return null;
  }
}
