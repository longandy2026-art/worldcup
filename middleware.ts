import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  
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
  
  // Set region cookie if just determined (persists for future requests)
  const shouldSetCookie = !regionCookie && region === 'CN'
  
  // Redirect logic — rewrite, not external redirect
  if (region === 'CN' && !url.pathname.startsWith('/zh-CN') && !url.pathname.startsWith('/api/')) {
    url.pathname = `/zh-CN${url.pathname}`
    const res = NextResponse.rewrite(url)
    if (shouldSetCookie) {
      res.cookies.set('sm_region', 'CN', { maxAge: 60 * 60 * 24 * 365, path: '/' })
    }
    res.headers.set('X-Region', 'CN')
    return res
  }
  
  if (region === 'OVERSEAS' && !url.pathname.startsWith('/en') && !url.pathname.startsWith('/api/') && !url.pathname.startsWith('/_next')) {
    url.pathname = `/en${url.pathname}`
    const res = NextResponse.rewrite(url)
    res.headers.set('X-Region', 'OVERSEAS')
    return res
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(png|jpg|svg|ico|css|js)$).*)'],
}
