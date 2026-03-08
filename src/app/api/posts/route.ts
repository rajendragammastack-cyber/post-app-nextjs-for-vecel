import { NextRequest, NextResponse } from 'next/server';
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
    const res = await fetch(`${API_URL}/api/posts`, { headers, cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const headers = await getAuthHeaders();
  if (!headers) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const contentType = request.headers.get('content-type') || '';
    let res: Response;
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const backendForm = new FormData();
      formData.forEach((value, key) => {
        backendForm.append(key, value);
      });
      res = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: { ...headers },
        body: backendForm,
      });
    } else {
      const body = await request.json();
      res = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body),
      });
    }
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
