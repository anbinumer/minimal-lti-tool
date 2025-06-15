import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Log all requests to LTI endpoints for debugging
  if (request.nextUrl.pathname.startsWith('/api/')) {
    console.log('=== MIDDLEWARE LOG ===');
    console.log('Method:', request.method);
    console.log('URL:', request.url);
    console.log('Pathname:', request.nextUrl.pathname);
    console.log('User-Agent:', request.headers.get('user-agent'));
    console.log('Content-Type:', request.headers.get('content-type'));
    console.log('Referer:', request.headers.get('referer'));
    console.log('Origin:', request.headers.get('origin'));
    console.log('Timestamp:', new Date().toISOString());
    
    // Canvas-specific detection
    const isCanvasRequest = request.headers.get('referer')?.includes('.instructure.com') || 
                           request.headers.get('origin')?.includes('.instructure.com') ||
                           request.headers.get('user-agent')?.includes('Canvas');
    console.log('Canvas Request:', isCanvasRequest ? 'YES' : 'NO');
    console.log('======================');
  }

  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    
    // Get the origin from the request
    const origin = request.headers.get('origin');
    
    // Check if origin is allowed (for Canvas domains)
    const isCanvasDomain = origin && (
      origin.includes('.instructure.com') ||
      origin === process.env.CANVAS_ISSUER ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    );
    
    if (isCanvasDomain || !origin) {
      response.headers.set('Access-Control-Allow-Origin', origin || '*');
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      console.log('=== CORS PREFLIGHT ===');
      console.log('Origin:', origin);
      console.log('Allowed:', isCanvasDomain || !origin);
      console.log('======================');
      return new NextResponse(null, { status: 200, headers: response.headers });
    }
    
    return response;
  }
  
  // Handle iframe embedding for the launch page
  if (request.nextUrl.pathname === '/launch') {
    console.log('=== LAUNCH PAGE ACCESS ===');
    console.log('URL:', request.url);
    console.log('Referer:', request.headers.get('referer'));
    console.log('User-Agent:', request.headers.get('user-agent')?.substring(0, 100));
    console.log('==========================');
    
    const response = NextResponse.next();
    
    // Allow iframe embedding from Canvas domains
    const origin = request.headers.get('referer') || request.headers.get('origin');
    if (origin && origin.includes('.instructure.com')) {
      response.headers.set('X-Frame-Options', 'ALLOWALL');
      response.headers.set('Content-Security-Policy', 'frame-ancestors *');
    } else {
      // More permissive for testing - in production you'd want to be more restrictive
      response.headers.set('X-Frame-Options', 'ALLOWALL');
      response.headers.set('Content-Security-Policy', 'frame-ancestors *');
    }
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/launch',
    '/.well-known/:path*'
  ],
}; 