import { NextResponse } from 'next/server';

export async function GET() {
  // Minimal JWKS for testing - you'll need real keys for production
  const jwks = {
    "keys": [
      {
        "kty": "RSA",
        "kid": "test-key",
        "use": "sig",
        "alg": "RS256",
        "n": "example-modulus",
        "e": "AQAB"
      }
    ]
  };
  
  return NextResponse.json(jwks, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
} 