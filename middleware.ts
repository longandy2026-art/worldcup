import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const pathname = url.pathname
  
  // Skip static assets and API routes
  if (pathname.startsWith('/_next/') || pathname.startsWith('/api/') || 
      pathname.includes('.') || pathname === '/favicon.ico') {
    return NextResponse.next()
  }
  
  // Cookie-based region override (user can manually switch)
  const regionCookie = request.cookies.get('sm_region')?.value
  
  // Cloudflare native country code
  const cfCountry = request.headers.get('cf-ipcountry')?.toUpperCase()
  const lang = request.headers.get('accept-language')?.toLowerCase() || ''
  
  // Determine region
  let region: 'CN' | 'OVERSEAS' = 'OVERSEAS'
  
  if (regionCookie) {
    region = regionCookie === 'CN' ? 'CN' : 'OVERSEAS'
  } else if (cfCountry === 'CN') {
    region = 'CN'
  } else if (lang.includes('zh-cn') && !lang.includes('zh-tw') && !lang.includes('zh-hk') && !lang.includes('zh-mo')) {
    region = 'CN'
  }
  
  // Set region cookie if just determined
  const shouldSetCookie = !regionCookie && region === 'CN'
  
  // Redirect logic
  if (region === 'CN' && !pathname.startsWith('/zh-CN')) {
    url.pathname = `/zh-CN${pathname}`
    const res = NextResponse.rewrite(url)
    if (shouldSetCookie) {
      res.cookies.set('sm_region', 'CN', { maxAge: 60 * 60 * 24 * 365, path: '/' })
    }
    res.headers.set('X-Region', 'CN')
    return res
  }
  
  if (region === 'OVERSEAS' && !pathname.startsWith('/en')) {
    url.pathname = `/en${pathname}`
    const res = NextResponse.rewrite(url)
    res.headers.set('X-Region', 'OVERSEAS')
    return res
  }
  
  return NextResponse.next()
}
