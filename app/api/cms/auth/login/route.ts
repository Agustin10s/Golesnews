import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/cms-db';
import { signToken, validatePassword, COOKIE_NAME } from '@/lib/cms-auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json() as { username: string; password: string };
    if (!username || !password) {
      return NextResponse.json({ error: 'Usuario y contraseña requeridos' }, { status: 400 });
    }

    const user = userDb.findByUsername(username);
    if (!user || !validatePassword(password, user.password)) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }

    const token = await signToken({ sub: String(user.id), username: user.username, role: user.role });
    const res = NextResponse.json({ ok: true, user: { id: user.id, username: user.username, name: user.name, role: user.role } });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
