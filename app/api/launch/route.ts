import { NextRequest, NextResponse } from 'next/server';

// CORS headers for Canvas integration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
};

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  console.log('=== LTI LAUNCH POST REQUEST ===');
  console.log('URL:', request.url);
  console.log('Headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    const contentType = request.headers.get('content-type') || '';
    let requestData: any = {};
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      // Handle form data
      const formData = await request.formData();
      requestData = Object.fromEntries(formData.entries());
      console.log('Form data received:', requestData);
    } else {
      // Handle other content types
      const body = await request.text();
      console.log('Raw body:', body);
      
      try {
        requestData = JSON.parse(body);
      } catch {
        requestData = { raw_body: body };
      }
    }
    
    // Check if this looks like an LTI 1.3 OIDC initiation request
    if (requestData.iss && requestData.login_hint) {
      console.log('This looks like an OIDC initiation request, redirecting to login handler');
      
      // Forward to login handler
      const loginUrl = new URL('/api/auth/lti/login', request.url);
      
      // Create form to POST to login endpoint
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>LTI Launch Redirect</title>
        </head>
        <body>
          <form id="login-form" method="POST" action="${loginUrl.toString()}">
            ${Object.entries(requestData).map(([key, value]) => 
              `<input type="hidden" name="${key}" value="${String(value)}" />`
            ).join('')}
          </form>
          <script>
            console.log('Auto-submitting to login handler');
            document.getElementById('login-form').submit();
          </script>
        </body>
        </html>
      `;
      
      return new NextResponse(html, {
        headers: { 
          'Content-Type': 'text/html',
          ...corsHeaders
        },
      });
    }
    
    // If it's not an OIDC initiation, redirect to launch page with data
    const launchUrl = new URL('/launch', request.url);
    launchUrl.searchParams.set('status', 'unknown_request');
    launchUrl.searchParams.set('data', JSON.stringify(requestData));
    
    console.log('Redirecting to launch page');
    return NextResponse.redirect(launchUrl);
    
  } catch (error) {
    console.error('LTI Launch Error:', error);
    
    const errorUrl = new URL('/launch', request.url);
    errorUrl.searchParams.set('error', 'launch_failed');
    errorUrl.searchParams.set('error_description', (error as Error).message);
    
    return NextResponse.redirect(errorUrl);
  }
}

export async function GET(request: NextRequest) {
  console.log('=== LTI LAUNCH GET REQUEST ===');
  console.log('URL:', request.url);
  
  // Direct GET access - just redirect to launch page
  const launchUrl = new URL('/launch', request.url);
  launchUrl.searchParams.set('status', 'direct_get_access');
  
  return NextResponse.redirect(launchUrl);
} 