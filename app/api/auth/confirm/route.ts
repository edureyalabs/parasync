// app/auth/confirm/route.ts
import { createServerClient } from '@supabase/ssr';
import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type') as EmailOtpType | null;
    const next = searchParams.get('next');

    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const base = `${protocol}://${host}`;

    if (!token_hash || !type) {
      return NextResponse.redirect(`${base}/auth/error?error=Missing+authentication+token`);
    }

    const cookieStore = await cookies();
    const defaultNext = type === 'recovery' ? '/auth/reset-password' : '/dashboard';
    const redirectTo = next?.startsWith('/') ? next : defaultNext;
    const response = NextResponse.redirect(`${base}${redirectTo}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (error) {
      return NextResponse.redirect(`${base}/auth/error?error=${encodeURIComponent(error.message)}`);
    }

    if (!data.user) {
      return NextResponse.redirect(`${base}/auth/error?error=Authentication+failed`);
    }

    return response;
  } catch {
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    return NextResponse.redirect(
      `${protocol}://${host}/auth/error?error=An+unexpected+error+occurred`
    );
  }
}