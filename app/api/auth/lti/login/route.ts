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
  console.log('=== LTI LOGIN POST REQUEST ===');
  console.log('URL:', request.url);
  console.log('Headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    // Canvas sends LTI 1.3 OIDC initiation as form data
    const formData = await request.formData();
    const loginData = Object.fromEntries(formData.entries());
    
    console.log('LTI Login Form Data:', loginData);
    
    // Required OIDC parameters from Canvas
    const iss = loginData.iss as string; // Canvas issuer
    const loginHint = loginData.login_hint as string;
    const targetLinkUri = loginData.target_link_uri as string;
    const clientId = loginData.client_id as string;
    
    // Validate required parameters
    if (!iss || !loginHint || !targetLinkUri || !clientId) {
      const missing = [];
      if (!iss) missing.push('iss');
      if (!loginHint) missing.push('login_hint');
      if (!targetLinkUri) missing.push('target_link_uri');
      if (!clientId) missing.push('client_id');
      
      throw new Error(`Missing required parameters: ${missing.join(', ')}`);
    }
    
    // Generate state and nonce for security
    const state = crypto.randomUUID();
    const nonce = crypto.randomUUID();
    
    console.log('Generated state:', state, 'nonce:', nonce);
    
    // Build Canvas authorization URL
    // Canvas authorization endpoint format: {iss}/api/lti/authorize_redirect
    const authUrl = new URL(`${iss}/api/lti/authorize_redirect`);
    authUrl.searchParams.set('response_type', 'id_token');
    authUrl.searchParams.set('response_mode', 'form_post');
    authUrl.searchParams.set('scope', 'openid');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', `${new URL(request.url).origin}/api/auth/lti/callback`);
    authUrl.searchParams.set('login_hint', loginHint);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('nonce', nonce);
    authUrl.searchParams.set('prompt', 'none');
    
    // Include LTI message hint if present
    if (loginData.lti_message_hint) {
      authUrl.searchParams.set('lti_message_hint', loginData.lti_message_hint as string);
    }
    
    console.log('Redirecting to Canvas authorization URL:', authUrl.toString());
    
    return NextResponse.redirect(authUrl.toString());
    
  } catch (error) {
    console.error('LTI Login Error:', error);
    
    // Return error response
    return NextResponse.json({ 
      error: 'login_failed',
      message: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { 
      status: 400,
      headers: corsHeaders
    });
  }
}

export async function GET(request: NextRequest) {
  console.log('=== LTI LOGIN GET REQUEST ===');
  console.log('URL:', request.url);
  console.log('Query params:', Object.fromEntries(new URL(request.url).searchParams.entries()));
  
  // Some Canvas configurations might send GET requests
  // Try to handle them by redirecting to a generic launch
  const launchUrl = new URL('/launch', request.url);
  launchUrl.searchParams.set('error', 'invalid_request_method');
  launchUrl.searchParams.set('error_description', 'Login endpoint accessed via GET instead of POST');
  
  return NextResponse.redirect(launchUrl);
} 