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
    let body: any = null;
    let parsedBody: any = null;
    
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
      parsedBody = Object.fromEntries(formData.entries());
      
      // Check for LTI-specific parameters
      if (parsedBody.id_token) {
        parsedBody._lti_detected = 'LTI 1.3 id_token found';
        parsedBody._lti_token_preview = parsedBody.id_token.substring(0, 50) + '...';
      }
      if (parsedBody.iss) {
        parsedBody._lti_issuer = parsedBody.iss;
      }
    } else {
      body = await request.text();
      parsedBody = body || 'Empty body';
    }
    
    const headers = Object.fromEntries(request.headers.entries());
    
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
        has_lti_data: !!(parsedBody?.id_token || parsedBody?.iss || parsedBody?.login_hint),
        lti_version: parsedBody?.id_token ? 'LTI 1.3' : 'Unknown/LTI 1.1',
        issuer: parsedBody?.iss || 'Not provided',
        client_id: parsedBody?.client_id || 'Not provided',
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