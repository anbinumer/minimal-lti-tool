import { NextRequest, NextResponse } from 'next/server';

// CORS headers for Canvas integration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET(request: NextRequest) {
  const debugInfo = {
    message: "Debug endpoint working",
    url: request.url,
    method: "GET",
    timestamp: new Date().toISOString(),
    headers: Object.fromEntries(request.headers.entries()),
    environment: {
      node_env: process.env.NODE_ENV,
      canvas_issuer: process.env.CANVAS_ISSUER ? '***SET***' : 'NOT_SET',
      canvas_client_id: process.env.CANVAS_CLIENT_ID ? '***SET***' : 'NOT_SET',
      lti_tool_url: process.env.LTI_TOOL_URL ? '***SET***' : 'NOT_SET',
    },
    nextjs_info: {
      version: "14+",
      app_router: true,
    }
  };
  
  return NextResponse.json(debugInfo, {
    headers: corsHeaders
  });
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    let body: string | null = null;
    let parsedBody: Record<string, unknown> | string = {};
    
    // Handle different content types
    if (contentType?.includes('application/json')) {
      body = await request.text();
      try {
        parsedBody = JSON.parse(body);
      } catch {
        parsedBody = 'Failed to parse JSON';
      }
    } else if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      body = 'FormData received';
      const formEntries = Object.fromEntries(formData.entries());
      parsedBody = formEntries;
      
      // Check for LTI-specific parameters
      if (formEntries.id_token) {
        (parsedBody as Record<string, unknown>)._lti_detected = 'LTI 1.3 id_token found';
        (parsedBody as Record<string, unknown>)._lti_token_preview = (formEntries.id_token as string).substring(0, 50) + '...';
      }
      if (formEntries.iss) {
        (parsedBody as Record<string, unknown>)._lti_issuer = formEntries.iss;
      }
    } else {
      body = await request.text();
      parsedBody = body || 'Empty body';
    }
    
    const headers = Object.fromEntries(request.headers.entries());
    const formEntries = typeof parsedBody === 'object' ? parsedBody as Record<string, unknown> : {};
    
    const debugInfo = {
      message: "Debug POST endpoint working",
      url: request.url,
      method: "POST",
      timestamp: new Date().toISOString(),
      content_type: contentType,
      headers,
      body_raw: body,
      body_parsed: parsedBody,
      canvas_detection: {
        is_canvas_request: headers.referer?.includes('.instructure.com') || 
                          headers.origin?.includes('.instructure.com') ||
                          headers['user-agent']?.includes('Canvas') || false,
        referrer: headers.referer || 'None',
        origin: headers.origin || 'None',
        user_agent: headers['user-agent']?.substring(0, 100) || 'None',
      },
      lti_analysis: {
        has_lti_data: !!(formEntries?.id_token || formEntries?.iss || formEntries?.login_hint),
        lti_version: formEntries?.id_token ? 'LTI 1.3' : 'Unknown/LTI 1.1',
        issuer: (formEntries?.iss as string) || 'Not provided',
        client_id: (formEntries?.client_id as string) || 'Not provided',
      }
    };
    
    return NextResponse.json(debugInfo, {
      headers: corsHeaders
    });
    
  } catch (error) {
    return NextResponse.json({
      error: "Failed to parse request",
      message: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { 
      status: 400,
      headers: corsHeaders
    });
  }
} 