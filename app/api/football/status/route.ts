import { NextResponse } from 'next/server';
import { cacheStats } from '@/lib/api-cache';

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

  try {
    const res = await fetch('https://v3.football.api-sports.io/status', {
      headers: { 'x-apisports-key': key },
      cache: 'no-store',
    });
    const data = await res.json();
    const account = data?.response;
    const errors  = data?.errors;
    const cache   = cacheStats();

    // Muestra si hay límite de requests alcanzado
    const limitReached = !!(
      errors?.requests &&
      String(errors.requests).includes('limit')
    );

    return NextResponse.json({
      ok: !limitReached,
      keySet: true,
      keyPreview: key.slice(0, 6) + '...',
      limitReached,
      requestsUsed:  account?.requests?.current  ?? null,
      requestsLimit: account?.requests?.limit_day ?? null,
      requestsLeft:  account?.requests?.limit_day != null
        ? account.requests.limit_day - (account.requests.current ?? 0)
        : null,
      plan: account?.subscription?.plan ?? null,
      account: account ?? null,
      errors: errors ?? null,
      cache,
      httpStatus: res.status,
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
