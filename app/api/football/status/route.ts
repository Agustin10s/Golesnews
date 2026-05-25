import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const key = process.env.FOOTBALL_API_KEY || '';
  const keySet = !!key && key !== 'YOUR_API_FOOTBALL_KEY_HERE';

  if (!keySet) {
    return NextResponse.json({
      ok: false,
      keySet: false,
      message: 'FOOTBALL_API_KEY no está configurada o tiene el valor placeholder',
    });
  }

  // Test real call to the API
  try {
    const res = await fetch('https://v3.football.api-sports.io/status', {
      headers: { 'x-apisports-key': key },
      cache: 'no-store',
    });
    const data = await res.json();
    const account = data?.response;
    return NextResponse.json({
      ok: true,
      keySet: true,
      keyPreview: key.slice(0, 6) + '...',
      account: account ?? null,
      httpStatus: res.status,
      raw: data,
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      keySet: true,
      error: String(e),
      message: 'La clave está configurada pero falló la llamada a la API',
    });
  }
}
