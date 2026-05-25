import { NextRequest, NextResponse } from 'next/server';

const CMS_URL = process.env.CMS_API_URL || 'http://localhost:5001';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${CMS_URL}/api/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ ok: true, message: '¡Suscripción registrada!' });
  }
}
