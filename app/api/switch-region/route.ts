import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const region = body.region === 'CN' ? 'CN' : 'OVERSEAS'
  
  const response = NextResponse.json({ success: true, region })
  response.cookies.set('sm_region', region, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
    sameSite: 'lax',
  })
  return response
}
