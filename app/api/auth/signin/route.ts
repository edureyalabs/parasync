// app/api/auth/signin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseRequestClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const { supabase, responseHeaders } = createSupabaseRequestClient(request);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const response = NextResponse.json({
      user: { id: data.user.id, email: data.user.email },
    });

    responseHeaders.getSetCookie?.()?.forEach((cookie) => {
      response.headers.append('Set-Cookie', cookie);
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}