import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.CMS_JWT_SECRET || 'golesnews-secret-change-in-production-2026',
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all /cms routes except /cms/login
  if (pathname.startsWith('/cms') && !pathname.startsWith('/cms/login')) {
    const token = req.cookies.get('cms_token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/cms/login', req.url));
    }
    try {
      await jwtVerify(token, SECRET);
      return NextResponse.next();
    } catch {
      const res = NextResponse.redirect(new URL('/cms/login', req.url));
      res.cookies.delete('cms_token');
      return res;
    }
  }

  // Protect CMS API routes
  if (pathname.startsWith('/api/cms') && !pathname.startsWith('/api/cms/auth/login')) {
    const token = req.cookies.get('cms_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    try {
      await jwtVerify(token, SECRET);
      return NextResponse.next();
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/cms/:path*', '/api/cms/:path*'],
};
