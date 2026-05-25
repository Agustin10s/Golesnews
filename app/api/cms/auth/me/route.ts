import { NextResponse } from 'next/server';
import { getSession } from '@/lib/cms-auth';
import { userDb } from '@/lib/cms-db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const user = userDb.findById(parseInt(session.sub));
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  return NextResponse.json({ user });
}
