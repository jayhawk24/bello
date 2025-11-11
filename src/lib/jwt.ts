import { SignJWT, jwtVerify } from 'jose';

const getSecret = () => {
  const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT secret not configured. Set NEXTAUTH_SECRET or JWT_SECRET');
  }
  return new TextEncoder().encode(secret);
};

export type AccessTokenPayload = {
  sub: string;
  role: string;
  hotelId?: string | null;
  typ?: 'access';
};

export async function signAccessToken(payload: AccessTokenPayload, expiresInSeconds = 3600) {
  const secret = getSecret();
  const now = Math.floor(Date.now() / 1000);
  return await new SignJWT({ role: payload.role, hotelId: payload.hotelId, typ: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt(now)
    .setExpirationTime(now + expiresInSeconds)
    .sign(secret);
}

export async function verifyAccessToken<T = any>(token: string) {
  const secret = getSecret();
  const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
  return payload as unknown as ({ sub: string } & T);
}

export function generateRefreshToken(): string {
  // 64 chars random hex token
  return [...crypto.getRandomValues(new Uint8Array(32))]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
