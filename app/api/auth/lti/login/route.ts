import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('LTI Login request received');
  
  try {
    const formData = await request.formData();
    const loginData = Object.fromEntries(formData.entries());
    
    console.log('LTI Login Data:', loginData);
    
    // Extract required OIDC parameters
    const iss = loginData.iss as string; // Platform issuer
    const loginHint = loginData.login_hint as string;
    // const targetLinkUri = loginData.target_link_uri as string; // Used in production
    const clientId = loginData.client_id as string;
    
    // Generate state and nonce for security
    const state = crypto.randomUUID();
    const nonce = crypto.randomUUID();
    
    // Store state/nonce (in production, use secure session storage)
    console.log('Generated state:', state, 'nonce:', nonce);
    
    // Build Canvas authentication URL
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
    
    console.log('Redirecting to:', authUrl.toString());
    
    return NextResponse.redirect(authUrl.toString());
    
  } catch (error) {
    console.error('LTI Login Error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  console.log('LTI Login GET request received');
  
  // Redirect to launch for GET requests
  const launchUrl = new URL('/launch', request.url);
  return NextResponse.redirect(launchUrl);
} 