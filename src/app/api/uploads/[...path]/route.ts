import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Proxy image requests to the backend so images work same-origin
 * and without needing NEXT_PUBLIC_API_URL.
 * GET /api/uploads/filename.jpeg -> backend GET /uploads/filename.jpeg
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const filename = pathSegments?.join('/');
  if (!filename) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  }
  try {
    const res = await fetch(`${API_URL}/uploads/${filename}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const blob = await res.blob();
    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err) {
    return new NextResponse(null, { status: 502 });
  }
}
