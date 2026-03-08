import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

const API_URL = NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
}

export async function GET() {
  const headers = await getAuthHeaders();
  if (!headers) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const res = await fetch(`${API_URL}/api/posts/feed`, { headers, cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
