import { NextRequest, NextResponse } from 'next/server';

const CMS_URL = process.env.CMS_API_URL || 'http://localhost:5001';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = searchParams.get('page') || '1';
    const per_page = searchParams.get('per_page') || '12';
    const category = searchParams.get('category') || '';
    const breaking = searchParams.get('breaking') || '';

    const params = new URLSearchParams({ page, per_page });
    if (category) params.set('category', category);
    if (breaking) params.set('breaking', breaking);

    const res = await fetch(`${CMS_URL}/api/public/articles?${params}`, {
      next: { revalidate: 120 }, // 2 min cache
    });

    if (!res.ok) return NextResponse.json({ articles: [], total: 0, page: 1, pages: 0 });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ articles: [], total: 0, page: 1, pages: 0 });
  }
}
