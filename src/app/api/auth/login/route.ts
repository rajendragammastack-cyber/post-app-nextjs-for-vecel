import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from '@/lib/constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Login failed' },
        { status: res.status }
      );
    }

    const token = data.data?.accessToken;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Invalid response from server' },
        { status: 502 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: data.message,
      data: {
        id: data.data.id,
        name: data.data.name,
        email: data.data.email,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);
    return response;
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
