// parasync/app/api/app/[agentId]/[taskId]/[appName]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: { agentId: string; taskId: string; appName: string } }
) {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { agentId, taskId, appName } = params;
  const backendUrl = `${BACKEND}/app/${agentId}/${taskId}/${appName}`;

  try {
    const res = await fetch(backendUrl, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!res.ok) {
      return new NextResponse(`App not found (${res.status})`, { status: res.status });
    }

    const html = await res.text();

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'SAMEORIGIN',
      },
    });
  } catch (e) {
    return new NextResponse(`Backend unreachable: ${e}`, { status: 502 });
  }
}