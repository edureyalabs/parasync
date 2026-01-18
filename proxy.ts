import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''
  
  // Extract subdomain
  const subdomain = hostname.split('.')[0]
  
  // Route based on subdomain
  if (subdomain === 'app' && !url.pathname.startsWith('/app')) {
    url.pathname = `/app${url.pathname}`
    return NextResponse.rewrite(url)
  }
  
  if (subdomain === 'biz' && !url.pathname.startsWith('/biz')) {
    url.pathname = `/biz${url.pathname}`
    return NextResponse.rewrite(url)
  }
  
  // Default/main domain
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 
