import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('LTI POST request received');
  
  try {
    // Canvas sends LTI data via POST form data
    const formData = await request.formData();
    const ltiData = Object.fromEntries(formData.entries());
    
    console.log('LTI POST Data:', ltiData);
    
    // Convert POST data to query parameters for the page
    const url = new URL('/launch', request.url);
    
    // Add key LTI parameters as query params
    Object.entries(ltiData).forEach(([key, value]) => {
      if (typeof value === 'string') {
        url.searchParams.set(key, value);
      }
    });
    
    // Redirect to GET page with parameters
    return NextResponse.redirect(url);
    
  } catch (error) {
    console.error('LTI POST Error:', error);
    return NextResponse.redirect(new URL('/launch', request.url));
  }
} 