import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('LTI Callback request received');
  
  try {
    const formData = await request.formData();
    const callbackData = Object.fromEntries(formData.entries());
    
    console.log('LTI Callback Data:', callbackData);
    
    // Extract the ID token from Canvas
    const idToken = callbackData.id_token as string;
    // const state = callbackData.state as string; // TODO: Validate state in production
    
    if (!idToken) {
      throw new Error('No ID token received from Canvas');
    }
    
    // In a real implementation, you would:
    // 1. Validate the state parameter
    // 2. Verify the JWT signature using Canvas public keys
    // 3. Validate the token claims (iss, aud, exp, etc.)
    // 4. Extract user and context information
    
    // For this minimal implementation, we'll just decode the token payload
    // WARNING: This is not secure for production use!
    const tokenParts = idToken.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const payload = JSON.parse(
      Buffer.from(tokenParts[1], 'base64url').toString('utf-8')
    );
    
    console.log('JWT Payload:', payload);
    
    // Redirect to launch page with LTI data
    const launchUrl = new URL('/launch', request.url);
    
    // Add key LTI claims as query parameters
    if (payload.name) launchUrl.searchParams.set('user_name', payload.name);
    if (payload.email) launchUrl.searchParams.set('user_email', payload.email);
    if (payload.sub) launchUrl.searchParams.set('user_id', payload.sub);
    if (payload['https://purl.imsglobal.org/spec/lti/claim/context']) {
      const context = payload['https://purl.imsglobal.org/spec/lti/claim/context'];
      if (context.title) launchUrl.searchParams.set('context_title', context.title);
      if (context.id) launchUrl.searchParams.set('context_id', context.id);
    }
    if (payload['https://purl.imsglobal.org/spec/lti/claim/resource_link']) {
      const resourceLink = payload['https://purl.imsglobal.org/spec/lti/claim/resource_link'];
      if (resourceLink.title) launchUrl.searchParams.set('resource_title', resourceLink.title);
    }
    
    // Add authentication status
    launchUrl.searchParams.set('authenticated', 'true');
    launchUrl.searchParams.set('auth_time', new Date().toISOString());
    
    console.log('Redirecting to launch with LTI data');
    return NextResponse.redirect(launchUrl);
    
  } catch (error) {
    console.error('LTI Callback Error:', error);
    
    // Redirect to launch page with error info
    const errorUrl = new URL('/launch', request.url);
    errorUrl.searchParams.set('error', 'authentication_failed');
    errorUrl.searchParams.set('error_description', (error as Error).message);
    
    return NextResponse.redirect(errorUrl);
  }
}

export async function GET(request: NextRequest) {
  console.log('LTI Callback GET request - redirecting to launch');
  return NextResponse.redirect(new URL('/launch', request.url));
} 